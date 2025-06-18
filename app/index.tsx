import React, { useRef, useState } from 'react';
import { 
  View, 
  TouchableOpacity,
  StyleSheet, 
  Text, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  SafeAreaView, 
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const webViewRef = useRef(null);
  const [texto, setTexto] = useState('');
  
  const [showWebView, setShowWebView] = useState(true); 
  const [isWebViewLoading, setIsWebViewLoading] = useState(true); 

  const onWebViewMessage = (event) => {
    const message = event.nativeEvent.data;
    console.log('Mensagem do WebView:', message);
  };

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <title>VLibras</title>
    <style>
      body, html {
        margin: 0;
        padding: 0;
        overflow: hidden;
        width: 100%;
        height: 100%;
        background-color: #fff;
      }
      #textoInvisivel, [vw-access-button] {
          display: none !important;
      }
      .vw-plugin-top-wrapper {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 100% !important;
        height: 100% !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }
    </style>
  </head>
  <body>
    <div id="textoInvisivel" vw-access></div>
    <div vw class="enabled">
      <div vw-access-button></div>
      <div vw-plugin-wrapper></div>
    </div>
    <script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
    <script>
       
        window.alert = function() {};
      (function() {
        const log = (msg) => window.ReactNativeWebView.postMessage(msg);
        new window.VLibras.Widget('https://vlibras.gov.br/app');
        window.traduzirTexto = function(novoTexto) {
          const el = document.getElementById('textoInvisivel');
          if (el) {
            el.textContent = novoTexto;
            el.click();
            log('Tradução acionada.');
          }
        };
        window.addEventListener('load', () => {
          log('WebView carregado. Abrindo o widget...');
          setTimeout(() => {
            const accessButton = document.querySelector('[vw-access-button]');
            if (accessButton) accessButton.click();
          }, 500);
        });
      })();
    </script>
  </body>
  </html>
  `;

  const injectTranslation = () => {
      if(webViewRef.current) {
        const textoEscapado = texto.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
        const js = `window.traduzirTexto('${textoEscapado}'); true;`;
        webViewRef.current.injectJavaScript(js);
      }
  };

  const handleTraduzir = () => {
    if (!texto.trim()) {
      Alert.alert('Aviso', 'Por favor, digite um texto para traduzir.');
      return;
    }
    injectTranslation();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <View style={styles.innerContainer}>
          <Text style={styles.header}>Tradutor para <Text style={styles.headerHighlight}>LIBRAS</Text></Text>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              value={texto}
              onChangeText={setTexto}
              placeholder="Escreva aqui..."
              placeholderTextColor="#9ca3af"
              multiline
            />
            <TouchableOpacity style={styles.button} onPress={handleTraduzir}>
              <Text style={styles.buttonText}>Traduzir</Text>
            </TouchableOpacity>
          </View>

          {showWebView && (
            <View style={styles.webviewContainer}>
              {isWebViewLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#4f46e5" />
                </View>
              )}
              <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                javaScriptEnabled
                domStorageEnabled
                onLoadStart={() => setIsWebViewLoading(true)}
                onLoadEnd={() => setIsWebViewLoading(false)}
                onMessage={onWebViewMessage}
                style={styles.webview}
                onError={() => {}}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#f3f4f6', 
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1, 
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 10
  },
  headerHighlight: {
    color: '#4f46e5',
  },
  subHeader: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20, 
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    minHeight: 20,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 16,
    color: '#1f2937',
    backgroundColor: '#f9fafb',
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#4f46e5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webviewContainer: {
    flex: 1, 
    width: '65%',
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff', 
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    minHeight: '30%'
  },
  webview: {
    flex: 1,
    opacity: 0.99,
    
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)'
  }
});
