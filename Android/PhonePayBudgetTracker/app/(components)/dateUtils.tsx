import { format, parse, addDays, addMonths, differenceInDays, isBefore } from 'date-fns';
import { View, Text, Button, FlatList, TouchableOpacity } from 'react-native';

const ExampleComponent: React.FC = () => {
  const currentDateStr = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const dateStr = '2024-10-22';
  const dateObj = parse(dateStr, 'yyyy-MM-dd', new Date());
  const newDate = addDays(new Date(), 5);
  const newMonthDate = addMonths(new Date(), 2);
  const daysDifference = differenceInDays(new Date(), dateObj);
  const isEarlier = isBefore(new Date(), dateObj);

  return (
    <View>
      <Text>Current Date: {currentDateStr}</Text>
      <Text>Parsed Date: {format(dateObj, 'yyyy-MM-dd')}</Text>
      <Text>Days Difference: {daysDifference}</Text>
      <Text>Is Today Earlier than {dateStr}? {isEarlier ? 'Yes' : 'No'}</Text>
    </View>
  );
};

export default ExampleComponent;
