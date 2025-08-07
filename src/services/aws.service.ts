import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { getAuthToken } from './educational.service';
import * as FileSystem from 'expo-file-system';
import { VideoCompressionService } from './video-compression.service';
import { Platform } from 'react-native';

const API_BASE_URL = 'http://192.168.100.4:3000';

export class AwsService {
    // Función para validar y preparar el video antes de subirlo
    private async prepareVideo(uri: string): Promise<{ uri: string; size: number }> {
        try {
            console.log('Preparando video:', uri);
            
            let fileSize = 0;
            
            // Obtener información del archivo de manera compatible con plataforma
            if (Platform.OS === 'web') {
                // En web, usar fetch para obtener información del archivo
                const response = await fetch(uri);
                const blob = await response.blob();
                fileSize = blob.size;
            } else {
                // En móvil, usar FileSystem
                const fileInfo = await FileSystem.getInfoAsync(uri);
                
                if (!fileInfo.exists) {
                    throw new Error('El archivo no existe');
                }
                
                fileSize = 'size' in fileInfo ? fileInfo.size : 0;
            }
            
            const fileSizeMB = fileSize / (1024 * 1024);
            
            console.log(`Tamaño del archivo: ${fileSizeMB.toFixed(2)} MB`);
            
            // Si el archivo es muy grande, rechazar directamente
            if (fileSizeMB > 50) {
                throw new Error(`El archivo es demasiado grande (${fileSizeMB.toFixed(2)} MB). El tamaño máximo permitido es 50MB.`);
            }
            
            // Si el archivo es mayor a 25MB, intentar compresión
            if (fileSizeMB > 25) {
                console.log('Archivo grande detectado, intentando optimización...');
                try {
                    const compressed = await VideoCompressionService.compressVideo(uri, {
                        maxSizeMB: 25
                    });
                    console.log(`Archivo procesado: ${VideoCompressionService.formatFileSize(compressed.size)}`);
                    return { uri: compressed.uri, size: compressed.size };
                } catch (compressionError) {
                    console.warn('No se pudo comprimir, usando archivo original:', compressionError);
                    return { uri, size: fileSize };
                }
            }
            
            return { uri, size: fileSize };
            
        } catch (error) {
            console.error('Error en prepareVideo:', error);
            throw error;
        }
    }

    async uploadFile(uri: string, onProgress?: (progress: number) => void): Promise<string> {
        try {
            console.log('Starting video upload for URI:', uri);
            
            // Preparar video (validar y comprimir si es necesario)
            const { uri: preparedUri, size: preparedSize } = await this.prepareVideo(uri);
            
            // Leer el archivo como base64
            const response = await fetch(preparedUri);
            const blob = await response.blob();
            
            // Verificar tamaño del blob
            console.log('Tamaño del blob:', blob.size, 'bytes');
            
            // Si el blob es muy grande, rechazar
            if (blob.size > 30 * 1024 * 1024) {
                throw new Error('El archivo procesado es demasiado grande. El tamaño máximo es 30MB.');
            }
            
            const reader = new FileReader();

            return new Promise((resolve, reject) => {
                reader.onload = async () => {
                    const base64Data = (reader.result as string).split(',')[1];
                    const fileName = preparedUri.split('/').pop() || `video-${Date.now()}.mp4`;

                    console.log('Uploading file:', fileName);
                    console.log('Base64 data size:', base64Data.length, 'characters');

                    try {
                        const token = await getAuthToken();
                        const response = await axios.post(
                            `${API_BASE_URL}/educational/upload-video`,
                            {
                                fileName,
                                fileData: base64Data,
                                contentType: 'video/mp4'
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                timeout: 300000, // 5 minutos de timeout
                                onUploadProgress: (progressEvent) => {
                                    if (onProgress && progressEvent.total) {
                                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                                        onProgress(percent);
                                    }
                                }
                            }
                        );

                        const s3Key = response.data.key;
                        
                        if (!s3Key) {
                            throw new Error('No se recibió la clave S3 del servidor');
                        }
                        
                        resolve(s3Key);
                    } catch (error) {
                        console.error('Error in upload request:', error);
                        
                        // Manejo específico del error 413
                        if (axios.isAxiosError(error) && error.response?.status === 413) {
                            reject(new Error('El archivo es demasiado grande para el servidor. Intente con un video más pequeño.'));
                        } else {
                            reject(error);
                        }
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    async getSignedUrl(key: string): Promise<string> {
        try {
            const token = await getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/educational/signed-url`, {
                params: { key },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.url;
        } catch (error) {
            console.error('Error getting signed URL:', error);
            throw error;
        }
    }

    async deleteFile(key: string): Promise<void> {
        try {
            const token = await getAuthToken();
            await axios.delete(`${API_BASE_URL}/educational/delete-video`, {
                params: { key },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    generateVideoKey(userId: string, title: string): string {
        const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const uuid = uuidv4();
        return `videos/${userId}/${sanitizedTitle}-${uuid}.mp4`;
    }
}
