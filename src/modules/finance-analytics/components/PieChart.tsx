import React from 'react';
import { View, Text } from 'react-native';
import { Svg, Circle, Path, G, Text as SvgText } from 'react-native-svg';
import { CategoryBreakdown } from '../FinanceAnalytics.types';

interface PieChartProps {
  data: CategoryBreakdown[];
  size?: number;
  innerRadius?: number;
  formatCurrency: (amount: number) => string;
  type?: 'expenses' | 'income';
}

interface PieSlice {
  categoryName: string;
  percentage: number;
  color: string;
  startAngle: number;
  endAngle: number;
  totalAmount: number;
}


const DEFAULT_COLORS = [
  '#FF6B6B', 
  '#4ECDC4', 
  '#45B7D1', 
  '#96CEB4', 
  '#FFEAA7', 
  '#DDA0DD', 
  '#98D8C8', 
  '#F7DC6F', 
  '#BB8FCE', 
  '#85C1E9', 
  '#F8C471', 
  '#82E0AA', 
];

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 160,
  innerRadius = 50,
  formatCurrency,
  type = 'expenses',
}) => {
  const radius = size / 2;
  const center = radius;
  const outerRadius = radius - 10;

  
  const total = data.reduce((sum, item) => sum + item.totalAmount, 0);

  
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  
  const createSlices = (): PieSlice[] => {
    let currentAngle = -90; 
    
    return dataWithColors.map((item) => {
      const percentage = (item.totalAmount / total) * 100;
      const angleSpan = (percentage / 100) * 360;
      
      const slice: PieSlice = {
        categoryName: item.categoryName,
        percentage,
        color: item.color!,
        startAngle: currentAngle,
        endAngle: currentAngle + angleSpan,
        totalAmount: item.totalAmount,
      };
      
      currentAngle += angleSpan;
      return slice;
    });
  };

  
  const polarToCartesian = (angle: number, radius: number) => {
    const angleInRadians = (angle * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(angleInRadians),
      y: center + radius * Math.sin(angleInRadians),
    };
  };

  
  const createArcPath = (slice: PieSlice) => {
    const { startAngle, endAngle } = slice;
    
    
    if (Math.abs(endAngle - startAngle) >= 360) {
      
      const midAngle = startAngle + 180;
      const startOuter = polarToCartesian(startAngle, outerRadius);
      const midOuter = polarToCartesian(midAngle, outerRadius);
      const startInner = polarToCartesian(startAngle, innerRadius);
      const midInner = polarToCartesian(midAngle, innerRadius);

      const pathData = [
        `M ${startOuter.x} ${startOuter.y}`,
        `A ${outerRadius} ${outerRadius} 0 0 1 ${midOuter.x} ${midOuter.y}`,
        `A ${outerRadius} ${outerRadius} 0 0 1 ${startOuter.x} ${startOuter.y}`,
        `L ${startInner.x} ${startInner.y}`,
        `A ${innerRadius} ${innerRadius} 0 0 0 ${midInner.x} ${midInner.y}`,
        `A ${innerRadius} ${innerRadius} 0 0 0 ${startInner.x} ${startInner.y}`,
        'Z'
      ].join(' ');

      return pathData;
    }

    const startOuter = polarToCartesian(startAngle, outerRadius);
    const endOuter = polarToCartesian(endAngle, outerRadius);
    const startInner = polarToCartesian(startAngle, innerRadius);
    const endInner = polarToCartesian(endAngle, innerRadius);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    const pathData = [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${endInner.x} ${endInner.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`,
      'Z'
    ].join(' ');

    return pathData;
  };

  const slices = createSlices();


  if (data.length === 0 || total === 0) {
    return (
      <View style={{ alignItems: 'center' }}>
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={(outerRadius + innerRadius) / 2}
            fill="none"
            stroke="#444444"
            strokeWidth={outerRadius - innerRadius}
          />
          <SvgText
            x={center}
            y={center - 8}
            textAnchor="middle"
            fontSize="12"
            fill="#AAAAAA"
            fontWeight="bold"
          >
            Sin datos
          </SvgText>
        </Svg>
      </View>
    );
  }


  if (data.length === 1) {
    const singleItem = dataWithColors[0];
    return (
      <View style={{ alignItems: 'center' }}>
        <Svg width={size} height={size}>
          {/* Círculo completo para una sola categoría */}
          <Circle
            cx={center}
            cy={center}
            r={(outerRadius + innerRadius) / 2}
            fill="none"
            stroke={singleItem.color}
            strokeWidth={outerRadius - innerRadius}
          />
          
          {/* Texto central con el total */}
          <SvgText
            x={center}
            y={center - 8}
            textAnchor="middle"
            fontSize="12"
            fill="#AAAAAA"
            fontWeight="bold"
          >
            Total
          </SvgText>
          <SvgText
            x={center}
            y={center + 8}
            textAnchor="middle"
            fontSize="14"
            fill="#FFFFFF"
            fontWeight="bold"
          >
            {formatCurrency(total)}
          </SvgText>
        </Svg>
      </View>
    );
  }

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <G>
          {slices.map((slice, index) => {
            return (
              <Path
                key={`slice-${index}`}
                d={createArcPath(slice)}
                fill={slice.color}
              />
            );
          })}
        </G>
        
    
        <SvgText
          x={center}
          y={center - 8}
          textAnchor="middle"
          fontSize="12"
          fill="#AAAAAA"
          fontWeight="bold"
        >
          Total
        </SvgText>
        <SvgText
          x={center}
          y={center + 8}
          textAnchor="middle"
          fontSize="14"
          fill="#FFFFFF"
          fontWeight="bold"
        >
          {formatCurrency(total)}
        </SvgText>
      </Svg>
    </View>
  );
};
