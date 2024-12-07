interface Transaction {
    account_id: string;
    amount: number;
    authorized_date: string;
    iso_currency_code: string;
    logo_url: string;
    merchant_name?: string;
    name: string;
    payment_channel: string;
    category?: string; 
    personal_finance_category?: {
      primary: string;
      detailed: string;
    };
  }

export const fetchTransactionsForMonth = async (
    userId: string,
    year: number,
    month: number
  ) => {
    try {
      const response = await fetch(
        "https://us-central1-phonepaybudgettracker.cloudfunctions.net/fetchTransactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId, year, month }),
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions for ${month}/${year}`);
      }
  
      const data = await response.json();

      const formatCategory = (rawCategory: string | null | undefined): string => {
        if (!rawCategory) return "Unknown";
        const formatted = rawCategory.replace(/_/g, " "); 
        return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
      };
  
      return data.transactions.map((transaction: Transaction) => ({
        account_id: transaction.account_id,
        amount: Math.abs(transaction.amount),
        authorized_date: transaction.authorized_date,
        iso_currency_code: transaction.iso_currency_code,
        logo_url: transaction.logo_url,
        name: transaction.merchant_name || transaction.name,
        payment_channel: transaction.payment_channel,
        category: formatCategory(transaction.personal_finance_category?.primary),
      }));
    } catch (error) {
      console.error(`Error fetching transactions for ${month}/${year}:`, error);
      throw error;
    }
  };
  