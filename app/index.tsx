import React, { useRef, useState, useEffect } from 'react';
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
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const webViewRef = useRef(null);
  const [texto, setTexto] = useState('');
  const [showWebView, setShowWebView] = useState(false); // Controla a visibilidade do WebView
  const [isWebViewLoading, setIsWebViewLoading] = useState(false); // Controla o loading do WebView

  // Função para lidar com as mensagens vindas do WebView (para depuração)
  const onWebViewMessage = (event) => {
    const message = event.nativeEvent.data;
    console.log('Mensagem do WebView:', message);
  };

  // HTML otimizado para simplesmente exibir o widget dentro do contêiner do WebView.
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="pt-br">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <title>VLibras</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
      }
      
      /* Oculta o elemento que serve apenas como fonte para o VLibras ler o texto */
      #textoInvisivelParaTraducao {
          display: none;
      }

      /* Esconde o botão flutuante padrão */
      [vw-access-button] {
        display: none !important;
      }
    </style>
  </head>
  <body>
    <!-- Elemento invisível que o VLibras usará para ler o texto -->
    <div id="textoInvisivelParaTraducao" vw-access>Aguardando texto...</div>

    <!-- Container do VLibras -->
    <div vw class="enabled">
      <div vw-access-button></div>
      <div vw-plugin-wrapper></div>
    </div>

    <script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
    <script>
      (function() {
        const log = (msg) => window.ReactNativeWebView.postMessage(msg);
        new window.VLibras.Widget('https://vlibras.gov.br/app');

        // Função global que será chamada pelo React Native
        window.traduzirTexto = function(novoTexto) {
          const el = document.getElementById('textoInvisivelParaTraducao');
          if (el) {
            el.textContent = novoTexto;
            el.click(); // Aciona a tradução do VLibras
            log('Tradução acionada.');
          }
        };

        // Abre o widget automaticamente
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

  // Função para iniciar a tradução
  const handleTraduzir = () => {
    if (!texto.trim()) {
      Alert.alert('Aviso', 'Por favor, digite um texto para traduzir.');
      return;
    }
    
    // Se o WebView ainda não estiver visível, mostre-o.
    if (!showWebView) {
      setShowWebView(true);
    } else {
      // Se já estiver visível, apenas injeta o novo texto.
      injectTranslation();
    }
  };
  
  // Função que injeta o JavaScript para traduzir o texto
  const injectTranslation = () => {
      if(webViewRef.current) {
        const textoEscapado = texto.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
        // CORREÇÃO: Removido o caractere de escape inválido antes do template literal
        const js = `window.traduzirTexto('${textoEscapado}'); true;`;
        webViewRef.current.injectJavaScript(js);
      }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.uiContainer}>
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

            {/* O WebView só é renderizado após o primeiro clique em "Traduzir" */}
            {showWebView && (
              <View style={styles.webviewContainer}>
                {isWebViewLoading && (
                  <ActivityIndicator size="large" style={styles.webviewLoading} />
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
                    // Injeta a tradução assim que o WebView termina de carregar
                    injectTranslation();
                  }}
                  onMessage={onWebViewMessage}
                  style={styles.webview}
                  onError={(e) => Alert.alert('Erro no WebView', e.nativeEvent.description || 'Ocorreu um erro')}
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
  uiContainer: {
    padding: 20,
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
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
  webviewContainer: {
    height: 400, // Altura fixa para a área do tradutor
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden', // Garante que o WebView respeite as bordas
    backgroundColor: '#fff', // Cor de fundo enquanto o WebView carrega
  },
  webview: {
    flex: 1,
    opacity: 0.99, // Pequeno truque para evitar alguns bugs de renderização no Android
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
