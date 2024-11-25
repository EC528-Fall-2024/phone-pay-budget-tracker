// import { HfInference } from '@huggingface/inference';

// const hf = new HfInference('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');

// // Categorize a transaction using zero-shot classification
// export async function categorizeTransaction(description) {
//   try {
//     const result = await hf.textClassification({
//       model: 'facebook/bart-large-mnli',
//       inputs: description,
//       parameters: {
//         candidate_labels: 'Dining, Rent, Groceries, Entertainment, Utilities, Other',
//       },
//     });

//     console.log(result);
//     if (result && result.length > 0) {
//       return result[0].label; // Return the top predicted category
//     }

//     return 'Uncategorized'; // Fallback if no result
//   } catch (error) {
//     console.error('Error categorizing transaction:', error);
//     return 'Uncategorized'; // Handle errors gracefully
//   }
// }

// import { HfInference } from '@huggingface/inference';

// const hf = new HfInference('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');

// export async function categorizeTransaction(description) {
//   try {
//     const result = await hf.request({
//       model: 'facebook/bart-large-mnli',
//       inputs: description,
//       parameters: {
//         candidate_labels: 'Dining, Rent, Groceries, Entertainment, Utilities, Other',
//       },
//     });

//     if (result && Array.isArray(result) && result[0]?.label) {
//       return result[0].label; // Return the top predicted category
//     }

//     console.warn('Unexpected output from Hugging Face API:', result);
//     return 'Uncategorized';
//   } catch (error) {
//     console.error('Error categorizing transaction:', error);
//     return 'Uncategorized';
//   }
// }

import { HfInference } from '@huggingface/inference';
import secrets from './secrets';


const hf = new HfInference(secrets.HUGGING_FACE_API_KEY);

export async function categorizeTransaction(description: string): Promise<string> {
  try {
    const result = await hf.request({
      model: 'facebook/bart-large-mnli',
      inputs: description,
      parameters: {
        candidate_labels: 'Dining, Rent, Groceries, Entertainment, Utilities, Other',
      },
    });

    // Handle the output format with labels and scores
    if (result && result.labels && result.scores) {
      const labels: string[] = result.labels;
      const scores: number[] = result.scores;

      // Find the highest score and corresponding label
      const maxScoreIndex = scores.indexOf(Math.max(...scores));
      return labels[maxScoreIndex].trim(); // Return the top label, trimming any extra whitespace
    }

    console.warn('Unexpected output from Hugging Face API:', result);
    return 'Uncategorized'; // Default category
  } catch (error) {
    console.error('Error categorizing transaction:', error);
    return 'Uncategorized';
  }
}


