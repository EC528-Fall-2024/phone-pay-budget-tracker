import React from "react";
import { View, Text, Dimensions } from "react-native";
import Svg, { G, Path, Circle } from "react-native-svg";

const { width } = Dimensions.get("window");

interface ChartData {
  name: string;
  value: number;
}

interface DonutChartProps {
  data: ChartData[];
  cardColor: string;
}

const colors = [
  "#918EF4",
  "#F8333C",
  "#FCAB10",
  "#2B9EB3",
  "#DBD5B5",
  "#FFEAEC",
  "#3F6C51",
  "#301A4B",
  "#6DB1BF",
  "#F39A9D",
  "#44AF69",
];

const cardColor = "#1E1E1E"; // Neutral-800

const getRandomColor = (index: number) => colors[index % colors.length];

const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  const radius = width * 0.2;
  const strokeWidth = 20;
  const innerRadius = radius - strokeWidth * 1.8;
  const center = radius + strokeWidth;
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  let cumulativeAngle = 0;
  const gapAngle = 2; 
  const sortedData = [...data]
    .sort((a, b) => b.value - a.value)
    .map((item) => ({
      ...item,
      percentage: (item.value / totalValue) * 100,
    }));

  const topCategories = sortedData.slice(0, 3);

  return (
    <View style={{ alignItems: "center", marginVertical: 20 }}>
      <Svg height={center * 2} width={center * 2}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {sortedData.map((item, index) => {
            const arcLength = (item.percentage / 100) * 360 - gapAngle;
            const startAngle = cumulativeAngle;
            const endAngle = cumulativeAngle + arcLength;
            cumulativeAngle += arcLength + gapAngle;
            const largeArcFlag = arcLength > 180 ? 1 : 0;
            const startX =
              center + radius * Math.cos((startAngle * Math.PI) / 180);
            const startY =
              center + radius * Math.sin((startAngle * Math.PI) / 180);
            const endX =
              center + radius * Math.cos((endAngle * Math.PI) / 180);
            const endY =
              center + radius * Math.sin((endAngle * Math.PI) / 180);

            const pathData = `
              M ${center} ${center}
              L ${startX} ${startY}
              A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
              Z
            `;

            return (
              <Path
                key={index}
                d={pathData}
                fill={getRandomColor(index)}
              />
            );
          })}
        </G>
        <Circle cx={center} cy={center} r={innerRadius} fill={cardColor} />
      </Svg>
      <View style={{ marginTop: 20 }}>
        {topCategories.map((item, index) => (
          <Text
            key={index}
            style={{
              fontSize: 18,
              color: getRandomColor(index),
              marginVertical: 4,
              fontFamily: "SpaceGroteskMedium",
            }}
          >
            {`${item.name}: ${item.percentage.toFixed(1)}%`}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default DonutChart;
