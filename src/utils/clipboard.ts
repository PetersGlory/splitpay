/**
 * Safely copy text to clipboard with fallback support
 * Handles various browser restrictions and permissions issues
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Modern Clipboard API (preferred method)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (clipboardErr) {
        console.warn('Clipboard API failed, trying fallback:', clipboardErr);
        // Fall through to fallback methods
      }
    }

    // Fallback method 1: Use textarea with execCommand
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make the textarea out of viewport
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    
    document.body.appendChild(textArea);
    
    // For iOS Safari
    if (navigator.userAgent.match(/ipad|ipod|iphone/i)) {
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      textArea.setSelectionRange(0, text.length);
    } else {
      textArea.select();
    }
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        return true;
      }
    } catch (execErr) {
      console.warn('execCommand copy failed:', execErr);
      document.body.removeChild(textArea);
    }

    // If all methods fail, return false
    return false;
  } catch (err) {
    console.error('All clipboard methods failed:', err);
    return false;
  }
}

/**
 * Copy text with user feedback
 * Shows alert as last resort if copying fails
 */
export async function copyWithFallback(
  text: string,
  fallbackMessage?: string
): Promise<boolean> {
  const success = await copyToClipboard(text);

  if (!success && fallbackMessage !== undefined) {
    // Show alert as absolute last resort
    const message = fallbackMessage || `Please copy this: ${text}`;
    alert(message);
  }
  
  return success;
}
