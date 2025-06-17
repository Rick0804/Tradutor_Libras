import React, { useRef, useState } from 'react';
import { 
  View, 
  Button, 
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
  const [showWebView, setShowWebView] = useState(false);
  const [isWebViewLoading, setIsWebViewLoading] = useState(false);

  // Função para lidar com as mensagens vindas do WebView (para depuração)
  const onWebViewMessage = (event) => {
    const message = event.nativeEvent.data;
    console.log('Mensagem do WebView:', message);
  };

  // HTML com CSS ajustado para forçar a centralização do widget
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
        background-color: #fff; /* Fundo branco para consistência */
      }
      
      #textoInvisivelParaTraducao, [vw-access-button] {
          display: none !important;
      }

      /* Força o wrapper do plugin a se posicionar no centro da tela do webview */
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
    <div id="textoInvisivelParaTraducao" vw-access>Aguardando texto...</div>
    <div vw class="enabled">
      <div vw-access-button></div>
      <div vw-plugin-wrapper></div>
    </div>
    <script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
    <script>
      (function() {
        const log = (msg) => window.ReactNativeWebView.postMessage(msg);
        new window.VLibras.Widget('https://vlibras.gov.br/app');
        window.traduzirTexto = function(novoTexto) {
          const el = document.getElementById('textoInvisivelParaTraducao');
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

  // Função que injeta o JavaScript para traduzir o texto
  const injectTranslation = () => {
      if(webViewRef.current) {
        const textoEscapado = texto.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
        const js = `window.traduzirTexto('${textoEscapado}'); true;`;
        webViewRef.current.injectJavaScript(js);
      }
  };

  // Função para iniciar a tradução
  const handleTraduzir = () => {
    if (!texto.trim()) {
      Alert.alert('Aviso', 'Por favor, digite um texto para traduzir.');
      return;
    }
    
    if (!showWebView) {
      setShowWebView(true);
    } else {
      injectTranslation();
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerContainer}>
            <Text style={styles.header}>VLibras no App</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={texto}
                onChangeText={setTexto}
                placeholder="Digite o texto para traduzir"
                multiline
              />
              <Button title="Traduzir" onPress={handleTraduzir} />
            </View>

            {showWebView && (
              <View style={styles.webviewContainer}>
                {isWebViewLoading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#007AFF" />
                  </View>
                )}
                <WebView
                  ref={webViewRef}
                  originWhitelist={['*']}
                  source={{ html: htmlContent }}
                  javaScriptEnabled
                  domStorageEnabled
                  onLoadStart={() => setIsWebViewLoading(true)}
                  onLoadEnd={() => {
                    setIsWebViewLoading(false);
                    injectTranslation();
                  }}
                  onMessage={onWebViewMessage}
                  style={styles.webview}
                  onError={(e) => Alert.alert('Erro no WebView', e.nativeEvent.description || 'Ocorreu um erro')}
                  scrollEnabled={false}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#f0f2f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  innerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  // Diminuímos a altura e garantimos o alinhamento central
  webviewContainer: {
    height: 270, // Altura reduzida
    width: '70%',
    alignSelf: 'center', // Centraliza horizontalmente
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff', 
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)'
  }
});
