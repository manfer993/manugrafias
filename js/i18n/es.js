// Español. Missing keys fall back to English (js/i18n/en.js).

export default {
  // Carga
  loadingLabel: 'Cargando',
  loading: 'Cargando…',
  jsRequired: 'Se necesita JavaScript.',

  // FR-02
  instructions: 'Sube el volumen, desactiva el modo silencio y apunta la cámara a la fotografía.',
  scanArtwork: 'Escanear obra',
  startingCamera: 'Iniciando cámara…',
  visitWebsite: 'Visitar sitio web',
  privacyPolicy: 'Política de privacidad',

  // FR-08
  mute: 'Silenciar',
  unmute: 'Activar sonido',

  // FR-09
  scanHint: 'Acércate a la fotografía y asegúrate de que esté bien iluminada.',

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
        body: 'Nuestros proveedores de alojamiento (GitHub y Google Firebase) pueden registrar datos técnicos, como direcciones IP, por motivos de seguridad. No usamos estos datos para identificarte.',
      },
      {
        heading: 'Enlaces externos',
        body: 'El botón "Visitar sitio web" abre el sitio del fotógrafo, que tiene su propia política de privacidad.',
      },
    ],
    contactHeading: 'Contacto',
    contactBody: 'Para cualquier pregunta, escribe a',
  },
};
