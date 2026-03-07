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

    // Always try Gemini first for dynamic, context-aware responses
    let aiResponse;
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + Deno.env.get('GEMINI_API_KEY'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful wildfire safety assistant for Canada. Provide practical, specific advice.

User: "${message}"

In 1-2 sentences, respond in ${detectedLanguage}.`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          return Response.json({ response: text, language: detectedLanguage });
        }
      }
    } catch (e) {
      // Fall through to fallback
    }

    // Fallback: Match specific keywords for accurate responses
    if (lowerMessage.match(/\bfire\b|\bsee\s+fire\b|\bfire\s+in\b/i)) {
      aiResponse = detectedLanguage === 'English'
        ? 'Call 911 immediately. Evacuate if authorities order evacuation. Do not attempt to extinguish. Move to a safe location away from the fire.'
        : detectedLanguage === 'French'
        ? 'Appelez 911 immédiatement. Évacuez si les autorités l\'ordonnent. Ne tentez pas d\'éteindre. Allez dans un endroit sûr loin du feu.'
        : detectedLanguage === 'Spanish'
        ? 'Llame a 911 inmediatamente. Evacúe si las autoridades lo ordenan. No intente extinguir. Vaya a un lugar seguro lejos del fuego.'
        : detectedLanguage === 'Russian'
        ? 'Звоните 911 немедленно. Эвакуируйтесь, если приказано. Не пытайтесь тушить. Идите в безопасное место.'
        : detectedLanguage === 'Ukrainian'
        ? 'Звоніть 911 негайно. Евакуюйтесь, якщо наказано. Не намагайтесь гасити. Йдіть у безпечне місце.'
        : 'Call 911 immediately. Evacuate to safety.';
    } else if (lowerMessage.match(/smoke|air quality|breathing|aqi/i)) {
      aiResponse = detectedLanguage === 'English'
        ? 'Stay indoors with windows/doors closed. Use HEPA air purifiers. Wear N95 masks outdoors. Limit strenuous activity. Check Air Quality Health Index for your region.'
        : detectedLanguage === 'French'
        ? 'Restez à l\'intérieur, portes et fenêtres fermées. Utilisez filtres HEPA. Portez masques N95 dehors. Limitez l\'activité intense. Vérifiez l\'indice de qualité de l\'air.'
        : detectedLanguage === 'Spanish'
        ? 'Permanezca adentro con puertas y ventanas cerradas. Use filtros HEPA. Lleve mascarillas N95 afuera. Limite la actividad intensa. Verifique la calidad del aire.'
        : 'Stay indoors, close windows. Use air purifiers. Wear N95 masks outside. Check air quality index.';
    } else if (lowerMessage.match(/prepare|ready|kit|evacuation plan|supplies|documents/i)) {
      aiResponse = detectedLanguage === 'English'
        ? 'Create an evacuation plan with alternate routes. Prepare a kit with documents, medications, water, and essentials. Know your local evacuation zones. Register for emergency alerts.'
        : detectedLanguage === 'French'
        ? 'Créez un plan d\'évacuation avec itinéraires alternatifs. Préparez un kit avec documents et médicaments. Connaissez vos zones d\'évacuation. Inscrivez-vous aux alertes d\'urgence.'
        : detectedLanguage === 'Spanish'
        ? 'Cree un plan de evacuación con rutas alternas. Prepare un kit con documentos y medicinas. Conozca sus zonas de evacuación. Regístrese para alertas de emergencia.'
        : 'Create evacuation plan. Prepare emergency kit. Know local evacuation zones. Register for alerts.';
    } else if (lowerMessage.match(/prevent|reduce risk|defensible space|clear vegetation/i)) {
      aiResponse = detectedLanguage === 'English'
        ? 'Clear dead vegetation within 10m of your property. Use fire-resistant plants. Ensure your roof and gutters are fire-rated. Create firebreaks. Remove overhanging branches.'
        : detectedLanguage === 'French'
        ? 'Dégagez la végétation morte à 10m de votre propriété. Utilisez plantes résistantes au feu. Assurez-vous que le toit est ignifuge. Créez des coupe-feu. Élaguez les branches.'
        : detectedLanguage === 'Spanish'
        ? 'Retire la vegetación muerta a 10m de su propiedad. Use plantas resistentes al fuego. Asegure que el techo sea ignífugo. Cree cortafuegos. Pode ramas colgantes.'
        : 'Clear vegetation within 10m. Use fire-resistant plants. Maintain fire-rated roof. Create firebreaks.';
    } else {
      aiResponse = detectedLanguage === 'English'
        ? 'I can help with wildfire safety. Ask about evacuation, preparation, smoke exposure, or fire prevention.'
        : detectedLanguage === 'French'
        ? 'Je peux aider avec la sécurité incendie. Posez des questions sur l\'évacuation, la préparation, l\'exposition à la fumée ou la prévention.'
        : detectedLanguage === 'Spanish'
        ? 'Puedo ayudar con seguridad de incendios. Pregunte sobre evacuación, preparación, exposición al humo o prevención.'
        : 'I can help with wildfire safety questions. Ask about evacuation, preparation, smoke, or prevention.';
    }

    return Response.json({ response: aiResponse, language: detectedLanguage });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});