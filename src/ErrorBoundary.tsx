import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            backgroundColor: '#dc2626',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            Error in App!
          </Text>
          <Text style={{ color: '#fff', fontSize: 14 }}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}
