import React from "react";
import { View, Text, Dimensions } from "react-native";
import Svg, { Line, Circle, Text as SvgText, Polyline } from "react-native-svg";

const { width } = Dimensions.get("window");

interface Transaction {
  amount: number;
  authorized_date: string;
}

interface LineChartCardProps {
  transactions: Transaction[];
}

const LineChartCard: React.FC<LineChartCardProps> = ({ transactions }) => {
  const cardWidth = width - 48;
  const chartHeight = 200;
  const chartWidth = cardWidth - 32;
  const daysInMonth = 31;
  const groupedByDay = Array(daysInMonth).fill(0);

  transactions.forEach((txn) => {
    const day = new Date(txn.authorized_date).getDate() - 1;
    groupedByDay[day] += txn.amount;
  });


  const totalSpent = groupedByDay.reduce((sum, val) => sum + val, 0);
  const avgSpent = totalSpent / daysInMonth;
  const totalTransactions = transactions.length;
  const maxSpent = Math.max(...groupedByDay);
  const maxSpentDay = groupedByDay.indexOf(maxSpent) + 1; 
  const maxSpentDate = transactions.find(
    (txn) => new Date(txn.authorized_date).getDate() === maxSpentDay
  )?.authorized_date;
  const maxY = Math.ceil(maxSpent / 5) * 5;
  const points = groupedByDay.map((amount, day) => ({
    x: (day / (daysInMonth - 1)) * chartWidth + 16,
    y: chartHeight - (amount / maxY) * chartHeight + 16, 
    amount, 
  }));

  if (transactions.length === 0) {
    return (
      <View
        style={{
          backgroundColor: "#1E1E1E", // Neutral-800
          borderRadius: 12,
          padding: 16,
          marginVertical: 16,
          width: cardWidth,
          alignSelf: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontFamily: "SpaceGroteskMedium",
            color: "#fde68a", // Amber-200
          }}
        >
          No Data Available
        </Text>
      </View>
    );
  }
  return (
    <View
      style={{
        backgroundColor: "#1E1E1E", // Neutral-800
        borderRadius: 12,
        padding: 16,
        marginVertical: 16,
        width: cardWidth,
        alignSelf: "center",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontFamily: "SpaceGroteskMedium",
          color: "#fde68a", // Amber-200
          marginBottom: 16,
        }}
      >
        Monthly Spending Trends
      </Text>
      {maxSpent > 0 && maxSpentDate && (
        <Text
          style={{
            fontSize: 16,
            fontFamily: "SpaceGroteskMedium",
            color: "#9CA3AF", 
            marginBottom: 8,
          }}
        >
          On{" "}
          <Text
            style={{
              color: "#F8719D",
              fontFamily: "SpaceGroteskBold",
            }}
          >
            {new Date(maxSpentDate).toLocaleDateString()}
          </Text>
          , you spent{" "}
          <Text
            style={{
              color: "#F8719D",
              fontFamily: "SpaceGroteskBold",
            }}
          >
            ${maxSpent.toFixed(2)}
          </Text>
        </Text>
      )}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "SpaceGroteskMedium",
            color: "#9CA3AF", // Neutral-400
          }}
        >
          Avg Spent:{" "}
          <Text
            style={{
                color: "#F8719D", // Neutral-400
            }}
            >
          ${avgSpent.toFixed(2)}
          </Text>
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: "SpaceGroteskMedium",
            color: "#9CA3AF", // Neutral-400
          }}
        >
          Transactions:{" "}  
          <Text
            style={{
                color: "#F8719D",
            }}
            >{totalTransactions}
            </Text>
        </Text>
      </View>
      <Svg height={chartHeight + 50} width={cardWidth}>
        <Polyline
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#fde68a" // Amber-200
          strokeWidth={2}
        />
        {points.map(
          (point, index) =>
            point.amount > 0 && (
              <Circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={4}  // radius circle
                fill="#fde68a"
              />
            )
        )}
        {maxSpent > 0 && (
          <>
            <Circle
              cx={points[maxSpentDay - 1].x}
              cy={points[maxSpentDay - 1].y}
              r={6}
              fill="#fde68a"
            />
            <SvgText
              x={points[maxSpentDay - 1].x - 15} 
              y={points[maxSpentDay - 1].y } 
              fontSize="12"
              fill="#fde68a"
              fontWeight="bold"
              textAnchor="end"
            >
              {"$" + maxSpent.toFixed(2).toString()}
            </SvgText>
          </>
        )}
        {points.map((point, index) =>
          (index + 1 === 1 || (index + 1) % 5 === 0) ? (
            <SvgText
              key={index}
              x={point.x}
              y={chartHeight + 36}
              fontSize="10"
              fill="#9CA3AF"
              textAnchor="middle"
            >
              {index + 1}
            </SvgText>
          ) : null
        )}
      </Svg>
    </View>
  );
};
export default LineChartCard;
