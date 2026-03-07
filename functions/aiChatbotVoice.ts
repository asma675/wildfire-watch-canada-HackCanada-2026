Deno.serve(async (req) => {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message required' }, { status: 400 });
    }

    // Language detection - check keywords first, then character patterns
    const detectLanguage = (text) => {
      const hindiChars = /[\u0900-\u097F]/;
      const ukrainianChars = /[єіїґ]/i;
      const russianChars = /[абвгдежзийклмнопрстуфхцчшщъыьэюяё]/i;
      const frenchKeywords = /\bbonjour\b|\bmerci\b|s'il\s+vous\s+plaît|ça|être|vous|\bje\b|\bqu|où|ù|é|è|ê|ë|û|ç/i;
      const spanishKeywords = /¿|¡|\bhola\b|\bgracias\b|por\s+favor|evacuación|incendio|fuego|humo|\byo\b|\btu\b|qué|vamos|está/i;
      const englishKeywords = /\bhow\b|\bare\b|\byou\b|\bwhat\b|\bwhere\b|\bwhen\b|\bwhy\b|\bhelp\b|\beveryone\b|\bplease\b/i;

      // Check character patterns first (most specific)
      if (hindiChars.test(text)) return 'Hindi';
      if (ukrainianChars.test(text)) return 'Ukrainian';
      if (russianChars.test(text)) return 'Russian';
      
      // Then check keywords
      if (frenchKeywords.test(text)) return 'French';
      if (spanishKeywords.test(text)) return 'Spanish';
      if (englishKeywords.test(text)) return 'English';
      
      return 'English';
    };

    const detectedLanguage = detectLanguage(message);
    const lowerMessage = message.toLowerCase();

    // Enhanced response templates for common questions
    const responses = {
      English: {
        prevent: 'To prevent forest fires: clear dead vegetation around your property, maintain a 10m defensible space, use fire-resistant plants, create firebreaks, and ensure your roof is fire-rated. Report suspicious activities to local fire authorities.',
        evacuation: 'If ordered to evacuate: leave immediately with essential documents and photos. Have a pre-planned route and destination. Don\'t lock doors (rescue crews need access). Head to designated evacuation centers and follow emergency broadcast instructions.',
        smoke: 'For smoke exposure: stay indoors with doors/windows closed. Use HEPA-filtered air purifiers. Wear N95 masks outdoors. Avoid strenuous activity. Monitor AirQuality.ca for your region\'s AQI levels. Vulnerable groups should relocate to clean air shelters.',
        mental: 'Wildfire anxiety is valid. Practice grounding techniques (5-4-3-2-1 senses). Stay connected with community. Limit news consumption. Have an emergency kit ready for peace of mind. Contact mental health services (1-800-463-2338) if overwhelmed.',
        prepare: 'Prepare now: Create an evacuation plan with multiple routes. Keep documents in a waterproof bag. Stock 2 weeks of medications/supplies. Learn your neighborhood\'s wildfire risk level. Sign up for emergency alerts and know your community\'s evacuation zones.',
        default: ''
      },
      French: {
        prevent: 'Pour prévenir les incendies de forêt: dégagez la végétation morte autour de votre propriété, maintenez un espace protégé de 10m, utilisez des plantes résistantes au feu, créez des coupe-feu et assurez-vous que votre toit est ignifuge. Signalez les activités suspectes aux autorités.',
        evacuation: 'En cas d\'évacuation: partez immédiatement avec documents et photos essentiels. Préparez un itinéraire alternatif. Ne verrouuillez pas les portes (sauveteurs ont besoin d\'accès). Rendez-vous aux centres d\'évacuation officiels et suivez les instructions.',
        smoke: 'Exposition à la fumée: restez à l\'intérieur, portes/fenêtres fermées. Utilisez des purificateurs HEPA. Portez masques N95 dehors. Évitez effort intense. Consultez QualitéAir.ca pour l\'indice de qualité de votre région. Groupes vulnérables: refuges à air pur.',
        mental: 'L\'anxiété face aux incendies est valide. Pratiquez des techniques d\'ancrage. Restez connecté avec votre communauté. Limitez la consommation de nouvelles. Préparez un kit d\'urgence. Contactez services santé mentale (1-800-463-2338) si accablé.',
        prepare: 'Préparez-vous: Créez plan d\'évacuation avec itinéraires alternatifs. Gardez documents dans sac étanche. Stock 2 semaines médicaments/fournitures. Vérifiez niveau risque incendie. Inscrivez-vous alertes urgence et connaissez zones d\'évacuation.',
        default: 'Je comprends votre question. Pour plus d\'informations, consultez Wildfire.gc.ca ou contactez les autorités locales.'
      },
      Spanish: {
        prevent: 'Para prevenir incendios forestales: retire vegetación muerta alrededor de su propiedad, mantenga espacio defensivo de 10m, use plantas resistentes al fuego, cree cortafuegos y asegure techo ignífugo. Reporte actividades sospechosas a autoridades locales.',
        evacuation: 'Si se ordena evacuación: salga inmediatamente con documentos esenciales y fotos. Tenga ruta alternativa planeada. No cierre puertas (equipos de rescate necesitan acceso). Dirígase a centros evacuación oficiales y siga instrucciones de emergencia.',
        smoke: 'Exposición a humo: permanezca adentro, puertas/ventanas cerradas. Use purificadores HEPA. Lleve mascarillas N95 afuera. Evite esfuerzo intenso. Consulte CalidadAire.ca para AQI región. Grupos vulnerables: refugios aire limpio.',
        mental: 'Ansiedad por incendios es válida. Practica técnicas enraizamiento. Mantente conectado comunidad. Limita noticias. Ten kit emergencia. Contacta salud mental (1-800-463-2338) si abrumado.',
        prepare: 'Prepárate: Crea plan evacuación rutas alternas. Guarda documentos bolsa impermeable. Acopio 2 semanas medicinas/suministros. Verifica nivel riesgo incendio. Inscríbete alertas emergencia y conoce zonas evacuación.',
        default: 'Entiendo tu pregunta. Para más información, visita Wildfire.gc.ca o contacta autoridades locales.'
      },
      Russian: {
        prevent: 'Предотвращение лесных пожаров: удалите мертвую растительность вокруг имущества, поддерживайте защитную зону 10м, используйте огнеустойчивые растения, создавайте противопожарные полосы. Сообщайте о подозрительной деятельности местным властям.',
        evacuation: 'При эвакуации: немедленно уходите с важными документами и фото. Имейте альтернативный маршрут. Не запирайте двери (спасатели нуждаются в доступе). Идите в официальные центры эвакуации и следуйте инструкциям.',
        smoke: 'От дыма: оставайтесь дома, двери/окна закрыты. Используйте HEPA-фильтры. Носите маски N95 на улице. Избегайте напряжения. Проверьте качество воздуха региона. Уязвимые группы: убежища чистого воздуха.',
        mental: 'Тревога о пожарах нормальна. Практикуйте заземление. Оставайтесь с сообществом. Ограничьте новости. Готовьте набор. Свяжитесь со здравоохранением (1-800-463-2338) если перегружены.',
        prepare: 'Подготовьтесь: Создайте план эвакуации маршруты. Документы в водонепроницаемые пакеты. Запас 2 недели медикаменты. Проверьте уровень риска. Подпишитесь на оповещения. Знайте зоны эвакуации.',
        default: ''
      },
      Ukrainian: {
        prevent: 'Попередження лісових пожеж: видаліть мертву рослинність навколо майна, утримуйте захисну зону 10м, використовуйте вогнестійкі рослини, створюйте протипожежні смуги. Повідомте про підозрілу діяльність місцевим властям.',
        evacuation: 'При евакуації: негайно виїхайте з важливими документами та фото. Має альтернативний маршрут. Не зачиняйте двері (рятувальники потребують доступу). Йдіть до офіційних центрів евакуації та слідуйте інструкціям.',
        smoke: 'Від диму: залишайтесь дома, двері/вікна закриті. Використовуйте HEPA-фільтри. Носіть маски N95 надворі. Уникайте напруги. Перевірте якість повітря регіону. Уразливі групи: притулки чистого повітря.',
        mental: 'Тривога про пожежі нормальна. Практикуйте заземлення. Залишайтесь з громадою. Обмежте новини. Готуйте набір. Звертайтесь до медичної служби (1-800-463-2338) якщо перевантажені.',
        prepare: 'Готуйтеся: Створіть план евакуації маршрути. Документи в водонепроникні сумки. Запас 2 тижні ліки. Перевірте рівень ризику. Підпишіться на сповіщення. Знайте зони евакуації.',
        default: ''
      },
      Hindi: {
        prevent: 'जंगल की आग रोकने के लिए: अपनी संपत्ति के चारों ओर मृत पौधों को हटाएं, 10 मीटर सुरक्षित क्षेत्र बनाएं, आग प्रतिरोधी पौधे लगाएं। संदिग्ध गतिविधि की रिपोर्ट करें।',
        evacuation: 'यदि निकासी का आदेश दिया जाए: महत्वपूर्ण दस्तावेज और फोटो के साथ तुरंत निकलें। वैकल्पिक मार्ग योजना बनाएं। दरवाजे बंद न करें। आधिकारिक निकासी केंद्रों में जाएं।',
        smoke: 'धुएं से: घर में रहें, दरवाजे/खिड़कियां बंद। HEPA फ़िल्टर का उपयोग करें। बाहर N95 मास्क पहनें। कठोर गतिविधि से बचें। हवा की गुणवत्ता जांचें।',
        mental: 'आग की चिंता सामान्य है। साँस लेने की तकनीक का अभ्यास करें। समुदाय से जुड़ें। आपातकालीन किट तैयार रखें। यदि अभिभूत हों तो मानसिक स्वास्थ्य सेवा से संपर्क करें।',
        prepare: 'तैयारी करें: निकासी योजना बनाएं। महत्वपूर्ण दस्तावेज सुरक्षित रखें। 2 सप्ताह की आपूर्ति रखें। आपातकालीन सतर्कता के लिए साइन अप करें।',
        default: ''
      }
    };

    // Always use Gemini for dynamic, context-aware responses
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + Deno.env.get('GEMINI_API_KEY'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful wildfire safety assistant for Canada. Provide practical, specific advice relevant to the user's situation.

User message: "${message}"

Answer in 2-3 sentences max, in ${detectedLanguage} only. Be direct and actionable.`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiResponse) {
          return Response.json({ response: aiResponse, language: detectedLanguage });
        }
      }
    } catch (e) {
      // Fallback to templates if Gemini fails
    }

    // Fallback: Categorize message to pick best template
    let responseKey = 'default';
    if (lowerMessage.match(/prevent|stop|reduce|risk|defense|defensible|clearance|dead wood|vegetation|preparation/i)) {
      responseKey = 'prevent';
    } else if (lowerMessage.match(/evacuate|escape|flee|leave|go|where|route|get out|emergency/i)) {
      responseKey = 'evacuation';
    } else if (lowerMessage.match(/smoke|air|breathe|health|exposure|mask|quality|aqi|breathing/i)) {
      responseKey = 'smoke';
    } else if (lowerMessage.match(/mental|stress|anxiety|fear|worried|anxious|psychology|depression|scared/i)) {
      responseKey = 'mental';
    } else if (lowerMessage.match(/prepare|ready|plan|kit|document|supply|gather|stock|ready/i)) {
      responseKey = 'prepare';
    }

    // Get response from templates
    let aiResponse = responses[detectedLanguage]?.[responseKey];
    
    // If template is empty for this language, use English as fallback
    if (!aiResponse) {
      aiResponse = responses['English']?.[responseKey] || responses['English']?.default;
    }

    return Response.json({ response: aiResponse, language: detectedLanguage });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});