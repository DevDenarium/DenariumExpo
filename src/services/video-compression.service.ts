import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface CompressionOptions {
    quality?: number; // 0-1
    maxSizeMB?: number;
    maxDurationSeconds?: number;
}

export class VideoCompressionService {
    
    static async compressVideo(
        uri: string, 
        options: CompressionOptions = {}
    ): Promise<{ uri: string; size: number; duration?: number }> {
        try {
            const {
                maxSizeMB = 20,
            } = options;

            console.log('Iniciando compresión de video:', uri);
            
            let originalSize = 0;
            
            // Obtener información del archivo original de manera compatible con plataforma
            if (Platform.OS === 'web') {
                // En web, usar fetch para obtener información
                try {
                    const response = await fetch(uri);
                    const blob = await response.blob();
                    originalSize = blob.size;
                } catch (error) {
                    console.warn('No se pudo obtener información del archivo en web:', error);
                    // Asumir un tamaño razonable para continuar
                    originalSize = 10 * 1024 * 1024; // 10MB
                }
            } else {
                // En móvil, usar FileSystem
                const originalInfo = await FileSystem.getInfoAsync(uri);
                
                if (!originalInfo.exists) {
                    throw new Error('El archivo de video no existe');
                }

                originalSize = 'size' in originalInfo ? originalInfo.size : 0;
            }

            const originalSizeMB = originalSize / (1024 * 1024);
            console.log(`Tamaño original: ${originalSizeMB.toFixed(2)} MB`);

            // Si el archivo ya es pequeño, no comprimir
            if (originalSizeMB <= maxSizeMB) {
                console.log('El archivo ya es lo suficientemente pequeño');
                return {
                    uri,
                    size: originalSize
                };
            }

            // Para la web y plataformas sin compresión nativa,
            // simplemente retornamos el archivo original con advertencia
            if (Platform.OS === 'web') {
                console.warn('Compresión no disponible en web');
                return {
                    uri,
                    size: originalSize
                };
            }

            // En otras plataformas, también retornamos el original por ahora
            // En el futuro se puede implementar compresión real
            console.log('Compresión nativa no implementada, usando archivo original');
            return {
                uri,
                size: originalSize
            };

        } catch (error) {
            console.error('Error en compresión de video:', error);
            throw new Error(`Error al comprimir video: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    static async getVideoInfo(uri: string): Promise<{
        size: number;
        duration?: number;
        width?: number;
        height?: number;
    }> {
        try {
            let size = 0;
            
            if (Platform.OS === 'web') {
                // En web, usar fetch para obtener información
                try {
                    const response = await fetch(uri);
                    const blob = await response.blob();
                    size = blob.size;
                } catch (error) {
                    console.warn('No se pudo obtener información del archivo en web:', error);
                    size = 0;
                }
            } else {
                // En móvil, usar FileSystem
                const fileInfo = await FileSystem.getInfoAsync(uri);
                
                if (!fileInfo.exists) {
                    throw new Error('El archivo no existe');
                }

                size = 'size' in fileInfo ? fileInfo.size : 0;
            }

            return {
                size
            };

        } catch (error) {
            console.error('Error obteniendo información del video:', error);
            throw error;
        }
    }

    static formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static async validateVideoFile(uri: string, maxSizeMB: number = 50): Promise<{
        isValid: boolean;
        error?: string;
        size?: number;
    }> {
        try {
            const info = await this.getVideoInfo(uri);
            const sizeMB = info.size / (1024 * 1024);

            if (sizeMB > maxSizeMB) {
                return {
                    isValid: false,
                    error: `El archivo es demasiado grande (${this.formatFileSize(info.size)}). El tamaño máximo permitido es ${maxSizeMB}MB.`,
                    size: info.size
                };
            }

            return {
                isValid: true,
                size: info.size
            };

        } catch (error) {
            return {
                isValid: false,
                error: `Error al validar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`
            };
        }
    }
}
