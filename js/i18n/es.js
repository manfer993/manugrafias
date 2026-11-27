// Español. Missing keys fall back to English (js/i18n/en.js).

export default {
  // Carga
  loadingLabel: 'Cargando',
  loading: 'Cargando…',
  jsRequired: 'Se necesita JavaScript.',

  // FR-02
  intro: 'Mira cada foto cobrar vida con video y sonido: toca Escanear obra y apunta la cámara a la foto impresa.',
  tipsTitle: 'Toma en cuenta estos tips antes de escanear',
  tipVolumeTitle: 'Sube el volumen',
  tipVolumeBody: 'Desactiva el modo silencio.',
  tipLightTitle: 'Busca buena luz',
  tipLightBody: 'Asegúrate de estar en un entorno bien iluminado.',
  tipAimTitle: 'Encuadra la foto completa',
  tipAimBody: 'Acércate lo suficiente para que se vea entera.',
  scanArtwork: 'Escanear obra',
  startingCamera: 'Iniciando cámara…',
  privacyPolicy: 'Política de privacidad',

  // FR-07
  linkInstagram: 'Instagram (se abre en una pestaña nueva)',
  linkBehance: 'Behance (se abre en una pestaña nueva)',
  linkPortfolio: 'Portafolio (se abre en una pestaña nueva)',
  photographerLinks: 'Enlaces del fotógrafo',
  connectTitle: 'Conecta conmigo',
  meanwhileTitle: 'Mientras tanto, conoce su trabajo',

  // Pantalla de cámara
  searching: 'Buscando obra…',
  centerHelp: 'Acércate a la foto y encuádrala dentro del marco.',
  mute: 'Silenciar',
  unmute: 'Activar sonido',

  // FR-08

  // FR-09
  scanHint: '¿Aún nada? Acércate un poco más y busca buena luz.',

  // ERR-06 / NFR-03
  videoUnavailable: 'Video no disponible, inténtalo de nuevo',
  videoLoading: 'Cargando video…',

  // ERR-01
  cameraDeniedTitle: 'Se necesita acceso a la cámara',
  cameraDeniedBody:
    'ManuGrafias usa la cámara para reconocer la fotografía. No se graba ni se envía nada.',
  cameraDeniedSteps: {
    ios: [
      'Para activarla: abre Ajustes > Safari > Cámara y elige Permitir,',
      'o toca “aA” en la barra de direcciones > Configuración del sitio web > Cámara > Permitir.',
      'Luego vuelve y toca Intentar de nuevo.',
    ],
    android: [
      'Para activarla: toca el icono junto a la barra de direcciones > Permisos > Cámara > Permitir.',
      'Luego toca Intentar de nuevo.',
    ],
  },
  tryAgain: 'Intentar de nuevo',

  // ERR-02
  inAppTitle: 'Abre en Safari / Chrome',
  inAppSteps: {
    ios: ['El navegador de esta app no puede abrir la cámara.', 'Toca ••• o el botón de compartir y elige “Abrir en Safari”.'],
    android: ['El navegador de esta app no puede abrir la cámara.', 'Toca ⋮ y elige “Abrir en Chrome”.'],
    other: ['El navegador de esta app no puede abrir la cámara.', 'Abre el enlace en Safari (iPhone) o Chrome (Android).'],
  },
  copyLink: 'Copiar enlace',
  linkCopied: 'Enlace copiado. Pégalo en Safari o Chrome.',

  // ERR-03
  desktopTitle: 'Abre este enlace en tu teléfono',
  desktopBody: 'Escanea este código QR con la cámara de tu teléfono.',
  unsupportedBody:
    'Este navegador no puede usar la cámara para realidad aumentada. Abre el enlace en Safari (iPhone) o Chrome (Android).',
  qrLabel: 'Código QR de esta página',

  // ERR-04
  notFoundTitle: 'Colección de obras no encontrada',
  notFoundBody: 'Revisa el código QR o el enlace que recibiste.',

  // ERR-10
  noArtworksTitle: 'Aún no hay obras disponibles',
  noArtworksBody: 'Las obras de {name} llegarán pronto.',

  // Error de carga de datos o librerías
  loadFailedTitle: 'Algo salió mal',
  loadFailedBody: 'No pudimos cargar las obras. Revisa tu conexión e inténtalo de nuevo.',

  // NFR-06: Política de privacidad
  privacy: {
    pageTitle: 'Política de privacidad - ManuGrafias',
    title: 'Política de privacidad - ManuGrafias AR',
    intro: 'ManuGrafias AR te permite ver videos sobre fotografías impresas usando la cámara de tu teléfono.',
    sections: [
      {
        heading: 'Cámara',
        body: 'La cámara se usa solo para reconocer la fotografía que tienes enfrente. Las imágenes se procesan en tu dispositivo y nunca se graban, almacenan ni envían a ningún servidor.',
      },
      {
        heading: 'Datos personales',
        body: 'No pedimos, recopilamos ni almacenamos datos personales. No necesitas una cuenta.',
      },
      {
        heading: 'Cookies y rastreo',
        body: 'Este sitio no usa cookies, analítica ni herramientas de rastreo.',
      },
      {
        heading: 'Alojamiento',
        body: 'Nuestros proveedores de servicios (GitHub, Google Firebase y Supabase, que alojan el sitio, los datos y los videos, y Google Fonts, que sirve las fuentes) pueden registrar datos técnicos, como direcciones IP, por motivos de seguridad. No usamos estos datos para identificarte.',
      },
      {
        heading: 'Enlaces externos',
        body: 'Los botones de Instagram, Behance y Portafolio abren las páginas del fotógrafo, que tienen sus propias políticas de privacidad.',
      },
    ],
    contactHeading: 'Contacto',
    contactBody: 'Para cualquier pregunta, escribe a',
  },
};
