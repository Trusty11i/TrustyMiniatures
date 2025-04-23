// Пример исправления отступов
exports.sendSignInLink = functions.https.onCall((data, context) => {
  const email = data.email; // Здесь должен быть 2 пробела отступа
  const actionCodeSettings = {
    url: 'http://example.com', // Завершающая запятая, если это объект
    handleCodeInApp: true
  };

  console.log(`Using API Key: ${apiKey}`);  // Проверка, не выводите ключ на клиентской части
});
