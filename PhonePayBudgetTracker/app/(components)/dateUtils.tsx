import { format, parse, addDays, addMonths, differenceInDays, isBefore } from 'date-fns';
import { View, Text, Button, FlatList, TouchableOpacity } from 'react-native';

const ExampleComponent: React.FC = () => {
  // Get the current date formatted as 'yyyy-MM-dd HH:mm:ss'
  const currentDateStr = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

  // Parse a string to a Date object
  const dateStr = '2024-10-22';
  const dateObj = parse(dateStr, 'yyyy-MM-dd', new Date());

  // Add days to a date
  const newDate = addDays(new Date(), 5);

  // Add months to a date
  const newMonthDate = addMonths(new Date(), 2);

  // Calculate days between two dates
  const daysDifference = differenceInDays(new Date(), dateObj);

  // Compare two dates (checks if one is before the other)
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
