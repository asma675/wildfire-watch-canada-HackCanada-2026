Deno.serve(async (req) => {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({ error: 'Message required' }, { status: 400 });
    }

    // Language detection
    const detectLanguage = (text) => {
      const hindiChars = /[\u0900-\u097F]/;
      const ukrainianChars = /[є і ї ґ]/i;
      const russianChars = /[а-яё]/i;
      const spanishKeywords = /¿|¡|hola|gracias|por favor|evacua|fuego|humo/i;
      const frenchKeywords = /bonjour|merci|s'il vous plaît|evacu|feu|fumée/i;

      if (hindiChars.test(text)) return 'Hindi';
      if (ukrainianChars.test(text)) return 'Ukrainian';
      if (russianChars.test(text)) return 'Russian';
      if (spanishKeywords.test(text)) return 'Spanish';
      if (frenchKeywords.test(text)) return 'French';
      return 'English';
    };

    const detectedLanguage = detectLanguage(message);
    const lowerMessage = message.toLowerCase();

    // Multi-language response templates
    const responses = {
      English: {
        evacuation: 'If ordered to evacuate, leave immediately with essential items. Follow designated routes and stay updated on local alerts.',
        smoke: 'Stay indoors with windows closed. Use N95 masks outdoors and monitor air quality. Drink water and watch for smoke-related health issues.',
        mental: 'It\'s normal to feel anxious during crises. Try breathing exercises, stay connected with others, and reach out to crisis hotlines if needed.',
        prepare: 'Prepare now: create an evacuation plan, gather important documents, keep emergency supplies, and know multiple evacuation routes from your area.',
        default: 'I understand your concern. Remember to stay informed through official channels and follow local emergency guidance.'
      },
      Spanish: {
        evacuation: 'Si se ordena la evacuación, abandone inmediatamente con artículos esenciales. Siga las rutas designadas y manténgase actualizado en alertas locales.',
        smoke: 'Permanezca adentro con ventanas cerradas. Use máscaras N95 al aire libre y monitoree la calidad del aire. Beba agua y vigile problemas de salud por humo.',
        mental: 'Es normal sentir ansiedad durante crisis. Intente ejercicios de respiración, manténgase conectado y contáctese con líneas de crisis si es necesario.',
        prepare: 'Prepárese ahora: cree un plan de evacuación, reúna documentos importantes, mantenga suministros de emergencia y conozca múltiples rutas de evacuación.',
        default: 'Entiendo su preocupación. Recuerde mantenerse informado a través de canales oficiales y seguir la guía de emergencia local.'
      },
      French: {
        evacuation: 'Si l\'évacuation est ordonnée, partez immédiatement avec des articles essentiels. Suivez les itinéraires désignés et restez informé des alertes locales.',
        smoke: 'Restez à l\'intérieur avec les fenêtres fermées. Portez des masques N95 à l\'extérieur et surveillez la qualité de l\'air. Buvez de l\'eau et surveillez les problèmes de santé liés à la fumée.',
        mental: 'C\'est normal de se sentir anxieux pendant les crises. Essayez des exercices de respiration, restez connecté aux autres et contactez les lignes de crise si nécessaire.',
        prepare: 'Préparez-vous maintenant: créez un plan d\'évacuation, rassemblez les documents importants, conservez des fournitures d\'urgence et connaissez les itinéraires d\'évacuation.',
        default: 'Je comprends votre préoccupation. N\'oubliez pas de rester informé par les canaux officiels et de suivre les directives d\'urgence locales.'
      },
      Russian: {
        evacuation: 'Если приказано эвакуироваться, немедленно уходите с необходимыми вещами. Следуйте назначенным маршрутам и оставайтесь в курсе местных оповещений.',
        smoke: 'Оставайтесь в помещении с закрытыми окнами. Используйте маски N95 на улице и следите за качеством воздуха. Пейте воду и следите за проблемами со здоровьем от дыма.',
        mental: 'Нормально чувствовать тревогу во время кризиса. Попробуйте дыхательные упражнения, оставайтесь на связи с людьми и обратитесь в кризисные центры при необходимости.',
        prepare: 'Подготовьтесь сейчас: создайте план эвакуации, соберите важные документы, держите запасы на случай чрезвычайной ситуации и знайте несколько маршрутов эвакуации.',
        default: 'Я понимаю вашу озабоченность. Помните, что будьте в курсе официальных каналов и следуйте местным рекомендациям по чрезвычайным ситуациям.'
      },
      Ukrainian: {
        evacuation: 'Якщо наказано евакуюватися, негайно покиньте місто з необхідними речами. Дотримуйтесь встановлених маршрутів та слідкуйте за місцевими сповіщеннями.',
        smoke: 'Залишайтеся в приміщенні з закритими вікнами. Використовуйте маски N95 надворі та стежте за якістю повітря. Пийте воду та спостерігайте за проблемами зі здоров\'ям від диму.',
        mental: 'Це нормально відчувати тривогу під час кризи. Спробуйте дихальні вправи, залишайтеся на зв\'язку з людьми та звертайтесь до кризисних ліній при необхідності.',
        prepare: 'Готуйтеся зараз: створіть план евакуації, зберіть важливі документи, тримайте запаси на випадок надзвичайної ситуації та знайте кілька маршрутів евакуації.',
        default: 'Я розумію вашу занепокоєність. Пам\'ятайте, будьте в курсі офіційних каналів та слідуйте місцевим рекомендаціям щодо надзвичайних ситуацій.'
      },
      Hindi: {
        evacuation: 'यदि खाली करने का आदेश दिया जाए तो आवश्यक चीजें लेकर तुरंत चले जाएं। निर्दिष्ट मार्गों का पालन करें और स्थानीय सतर्कताओं में अपडेट रहें।',
        smoke: 'घर के अंदर खिड़कियां बंद रखें। बाहर N95 मास्क पहनें और हवा की गुणवत्ता की निगरानी करें। पानी पिएं और धुएं से संबंधित स्वास्थ्य समस्याओं पर ध्यान दें।',
        mental: 'संकट के दौरान चिंतित महसूस करना सामान्य है। श्वास व्यायाम करने का प्रयास करें, दूसरों के साथ जुड़े रहें और यदि आवश्यक हो तो संकट हेतु फोन करें।',
        prepare: 'अभी तैयार हो जाएं: निकासी योजना बनाएं, महत्वपूर्ण दस्तावेज इकट्ठा करें, आपातकालीन आपूर्ति रखें और निकासी के कई मार्ग जानें।',
        default: 'मैं आपकी चिंता को समझता हूँ। आधिकारिक चैनलों के माध्यम से सूचित रहें और स्थानीय आपातकालीन मार्गदर्शन का पालन करें।'
      }
    };

    // Match message keywords to response category
    let responseCategory = 'default';
    if (lowerMessage.includes('evacuat') || lowerMessage.includes('leave') || lowerMessage.includes('partir') || lowerMessage.includes('эвакуир')) {
      responseCategory = 'evacuation';
    } else if (lowerMessage.includes('smoke') || lowerMessage.includes('air') || lowerMessage.includes('fumée') || lowerMessage.includes('дым')) {
      responseCategory = 'smoke';
    } else if (lowerMessage.includes('mental') || lowerMessage.includes('stress') || lowerMessage.includes('anxiet') || lowerMessage.includes('тревог')) {
      responseCategory = 'mental';
    } else if (lowerMessage.includes('prepare') || lowerMessage.includes('ready') || lowerMessage.includes('préparer') || lowerMessage.includes('подготов')) {
      responseCategory = 'prepare';
    }

    const aiResponse = responses[detectedLanguage]?.[responseCategory] || responses[detectedLanguage]?.default;

    return Response.json({ response: aiResponse, language: detectedLanguage });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});