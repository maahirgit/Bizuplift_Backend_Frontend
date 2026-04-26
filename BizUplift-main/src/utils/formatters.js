/**
 * utils/formatters.js
 * Helpers to make technical IDs and data more human-readable.
 */

/**
 * Formats a long technical ID (like MongoDB ObjectId) into a short, readable Order Number.
 * Example: '69ec8663830a273a96bb7d8' -> 'BZ-830A273A'
 */
export const formatOrderId = (id) => {
    if (!id) return 'N/A';
    // Take the middle-to-end portion of the ID which is usually more unique/variable than the timestamp start
    const shortId = id.toString().slice(-8).toUpperCase();
    return `BZ-${shortId}`;
};

/**
 * Formats a currency amount into Indian Rupees (INR).
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};
