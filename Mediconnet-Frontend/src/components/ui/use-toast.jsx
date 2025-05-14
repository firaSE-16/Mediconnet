export const useToast = () => {
    const { addToast } = useContext(ToastContext) || {};
  
    const toast = (options) => {
      if (!addToast) {
        console.warn("ToastProvider not found. Toast not displayed:", options);
        return;
      }
      addToast(options);
    };
  
    return { toast };
  };