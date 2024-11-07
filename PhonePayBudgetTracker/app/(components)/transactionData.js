export const carousalData = [
    {
      id: 1,
      imgUrl: require("../../assets/images/visa.png"),
      price: 2345,
      cardType: "VISA",
      cardNumber: "****1234",
      backgroundColor: "#0f60d6",
      textColor: "white",
    },
    {
      id: 2,
      imgUrl: require("../../assets/images/mastercard.png"),
      price: 4654,
      cardType: "MasterCard",
      cardNumber: "****5678",
      backgroundColor: "purple",
      textColor: "white",
    },
    {
      id: 3,
      imgUrl: require("../../assets/images/chase.png"),
      price: 3300,
      cardType: "Chase",
      cardNumber: "****5354",
      backgroundColor: "blue",
      textColor: "white",
    },
  ];
  
  export const transactionData = [
    {
      id: 1,
      description: "YouTube Premium",
      category: "Subscription",
      amount: "$14.99",
      date: "20 October 2024",
      account: "VISA",
    },
    {
      id: 2,
      description: "Starbucks",
      category: "In Store",
      amount: "$7.99",
      date: "22 October 2024",
      account: "MasterCard",
    },
    {
      id: 3,
      description: "Amazon",
      category: "Shopping",
      amount: "$9.99",
      date: "18 October 2024",
      account: "Chase",
    },
    {
      id: 4,
      description: "Netflix",
      category: "Subscription",
      amount: "$99.00",
      date: "12 October 2024",
      account: "VISA",
    },
    {
      id: 5,
      description: "Amazon",
      category: "Subscription",
      amount: "$12.99",
      date: "15 October 2024",
      account: "VISA",
    },
    
  ];
  
  carousalData.forEach((item) => {
    item.price = item.price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  });