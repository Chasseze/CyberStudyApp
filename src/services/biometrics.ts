import * as LocalAuthentication from 'expo-local-authentication';

export const checkBiometricSupport = async () => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return { supported: false, enrolled: false };
    }
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return { supported: true, enrolled: isEnrolled };
  } catch (error) {
    console.warn('Biometric check failed', error);
    return { supported: false, enrolled: false };
  }
};

export const authenticateWithBiometrics = async (reason = 'Authenticate to continue') => {
  try {
    return await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Enter passcode',
    });
  } catch (error) {
    console.warn('Biometric auth failed', error);
    return { success: false, error } as const;
  }
};
