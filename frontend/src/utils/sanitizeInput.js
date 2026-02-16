// Prevents SQL injections in feilds
export const sanitizeInput =  (text) => {
    return text.replace(/[-<>;()=_]/g, "");
}