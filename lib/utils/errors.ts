import { CONTRACT_ERRORS } from '../stacks/constants';

/**
 * Extract error code from contract error response
 */
export function extractErrorCode(error: any): string | null {
  try {
    const errorString = error?.toString() || '';
    const match = errorString.match(/\(err (u\d+)\)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Get user-friendly error message from contract error
 */
export function getErrorMessage(error: any): string {
  // Check if it's a contract error
  const errorCode = extractErrorCode(error);
  if (errorCode && CONTRACT_ERRORS[errorCode]) {
    return CONTRACT_ERRORS[errorCode];
  }

  // Check for specific error messages
  const errorString = error?.toString() || '';
  
  if (errorString.includes('User rejected')) {
    return 'Transaction cancelled by user';
  }
  
  if (errorString.includes('Insufficient funds')) {
    return 'Insufficient STX balance';
  }
  
  if (errorString.includes('Network error')) {
    return 'Network error - Please check your connection';
  }
  
  if (errorString.includes('Timeout')) {
    return 'Transaction timed out - Please try again';
  }

  // Generic error message
  return error?.message || 'An unexpected error occurred';
}

/**
 * Parse contract response for errors
 */
export function parseContractResponse(response: any): { success: boolean; error?: string; data?: any } {
  try {
    if (!response) {
      return { success: false, error: 'No response from contract' };
    }

    // Check if response indicates an error
    if (response.type === 'error') {
      const errorCode = extractErrorCode(response);
      return {
        success: false,
        error: errorCode && CONTRACT_ERRORS[errorCode] 
          ? CONTRACT_ERRORS[errorCode] 
          : 'Contract execution failed',
      };
    }

    return { success: true, data: response };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

/**
 * Validate transaction status
 */
export function isTransactionPending(txStatus: string): boolean {
  return txStatus === 'pending' || txStatus === 'broadcasted';
}

export function isTransactionSuccess(txStatus: string): boolean {
  return txStatus === 'success' || txStatus === 'confirmed';
}

export function isTransactionFailed(txStatus: string): boolean {
  return txStatus === 'failed' || txStatus === 'error' || txStatus === 'abort_by_response';
}

/**
 * Create error log for debugging
 */
export function logError(context: string, error: any): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, {
      message: getErrorMessage(error),
      code: extractErrorCode(error),
      raw: error,
    });
  }
}
