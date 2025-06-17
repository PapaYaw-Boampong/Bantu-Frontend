// export function triggerControlledLoading(
//     setLoading: React.Dispatch<React.SetStateAction<boolean>>,
//     isLoadingRef: () => boolean,
//     callback: () => void,
//     minDuration = 2000
//   ) {
//     setLoading(true);
//     const startTime = Date.now();
  
//     callback();
  
//     const interval = setInterval(() => {
//       const elapsed = Date.now() - startTime;
//       if (!isLoadingRef() && elapsed >= minDuration) {
//         setLoading(false);
//         clearInterval(interval);
//       }
//     }, 100);
//   }
  
  export async function triggerControlledLoading(
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    isLoadingRef: () => boolean,
    callback: () => Promise<void> | void,
    minDuration = 2000
  ) {
    setLoading(true);
    const startTime = Date.now();
  
    try {
      await callback(); // 🔧 Ensures async work is done
    } catch (err) {
      console.error("Error in loading callback:", err);
    }
  
    const elapsed = Date.now() - startTime;
    const remaining = minDuration - elapsed;
  
    setTimeout(() => {
      const checkIfDone = () => {
        if (!isLoadingRef()) {
          setLoading(false);
        } else {
          setTimeout(checkIfDone, 100);
        }
      };
      checkIfDone();
    }, Math.max(remaining, 0));
  }
  