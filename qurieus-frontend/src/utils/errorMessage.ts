export function extractErrorMessage(error: any): string {
  let errorMsg = "Sorry, I encountered an error. Please try again.";
  let errorObj = error?.response?.data;
  if (typeof errorObj === "string") {
    try {
      errorObj = JSON.parse(errorObj);
    } catch {
      // leave as string
    }
  }
  if (errorObj?.error) {
    if (typeof errorObj.error === "string") {
      errorMsg = errorObj.error;
    } else if (typeof errorObj.error === "object" && errorObj.error.message) {
      errorMsg = errorObj.error.message;
    } else {
      errorMsg = JSON.stringify(errorObj.error);
    }
  }
  return errorMsg;
} 