let snapScriptLoaded = false;

export const loadMidtransSnap = (clientKey) => {
  return new Promise((resolve, reject) => {
    if (snapScriptLoaded && window.snap) {
      resolve(window.snap);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    
    script.onload = () => {
      snapScriptLoaded = true;
      if (window.snap) {
        resolve(window.snap);
      } else {
        reject(new Error('Snap not available'));
      }
    };
    
    script.onerror = () => reject(new Error('Failed to load Midtrans Snap'));
    document.body.appendChild(script);
  });
};

export const payWithMidtrans = async (snapToken, clientKey, callbacks = {}) => {
  try {
    const snap = await loadMidtransSnap(clientKey);
    
    snap.pay(snapToken, {
      onSuccess: (result) => {
        callbacks.onSuccess?.(result);
      },
      onPending: (result) => {
        callbacks.onPending?.(result);
      },
      onError: (result) => {
        callbacks.onError?.(result);
      },
      onClose: () => {
        callbacks.onClose?.();
      }
    });
  } catch (error) {
    callbacks.onError?.(error);
  }
};
