// gitprofile.config.ts

const CONFIG = {
  github: {
    username: 'chandralegend', // Your GitHub org/user name. (This is the only required config)
  },
  /**
   * If you are deploying to https://<USERNAME>.github.io/, for example your repository is at https://github.com/arifszn/arifszn.github.io, set base to '/'.
   * If you are deploying to https://<USERNAME>.github.io/<REPO_NAME>/,
   * for example your repository is at https://github.com/arifszn/portfolio, then set base to '/portfolio/'.
   */
  base: '/',
  projects: {
    github: {
      display: true, // Display GitHub projects?
      header: 'Github Projects',
      mode: 'manual', // Mode can be: 'automatic' or 'manual'
      automatic: {
        sortBy: 'stars', // Sort projects by 'stars' or 'updated'
        limit: 8, // How many projects to display.
        exclude: {
          forks: true, // Forked projects will not be displayed if set to true.
          projects: [], // These projects will not be displayed. example: ['arifszn/my-project1', 'arifszn/my-project2']
        },
      },
      manual: {
        // Properties for manually specifying projects
        projects: ['chandralegend/argonauts', 'Jaseci-Labs/mtllm', 'Jaseci-Labs/jac-analyzer', 'aya-multitokenizer/multi-tokenizer', 'aya-multitokenizer/multi-tokernizer-llm', 'Jaseci-Labs/jaclang'],
      },
    },
    external: {
      header: 'My Projects',
      // To hide the `External Projects` section, keep it empty.
      projects: [
        {
          title: 'Project Name',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut.',
          imageUrl:
            'https://img.freepik.com/free-vector/illustration-gallery-icon_53876-27002.jpg',
          link: 'https://example.com',
        },
        {
          title: 'Project Name',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc ut.',
          imageUrl:
            'https://img.freepik.com/free-vector/illustration-gallery-icon_53876-27002.jpg',
          link: 'https://example.com',
        },
      ],
    },
  },
  seo: {
    title: 'Portfolio of Chandra Irugalbandara',
    description: 'Sr. AI Engineer, Researcher, Technical Consultant, Entrepreneur',
    imageURL: '',
  },
  social: {
    linkedin: 'chandralegend',
    twitter: 'cirugal',
    mastodon: '',
    researchGate: '',
    facebook: '',
    instagram: 'realchandralegend',
    reddit: '',
    threads: 'realchandralegend',
    youtube: '', // example: 'pewdiepie'
    udemy: '',
    dribbble: '',
    behance: '',
    medium: 'chandralegend',
    dev: 'chandralegend',
    stackoverflow: '', // example: '1/jeff-atwood'
    skype: '',
    telegram: '',
    website: 'https://chandra.irugalbandara.org',
    phone: '',
    email: 'irugalbandara@ascii.ai',
  },
  resume: {
    fileUrl:
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Empty fileUrl will hide the `Download Resume` button.
  },
  skills: [
    'Python', 'Rust', 'TypeScript', 'Jaclang', 'PyTorch', 'Tensorflow', 'Transformers', 'Natural Language Processing', 'Computer Vision', 'Leadership', 'Project Management'
  ],
  experiences: [
    {
      company: 'Jaseci Labs',
      position: 'Sr. ML Engineer',
      from: 'January 2024',
      to: 'Present',
      companyLink: 'https://www.jaseci.org',
    },
    {
      company: 'Jaseci Labs',
      position: 'ML Engineer',
      from: 'August 2022',
      to: 'December 2023',
      companyLink: 'https://www.jaseci.org',
    },
    {
      company: 'PromiseQ',
      position: 'Founding ML Engineer',
      from: 'September 2021',
      to: 'June 2022',
    },
    {
      company: 'ASCII Corporation',
      position: 'CEO/Co-Founder',
      from: 'January 2023',
      to: 'Present',
    }
  ],
  certifications: [],
  educations: [
    {
      institution: 'University of Moratuwa',
      degree: 'Bachelor of Science in Electrical Engineering',
      from: '2017',
      to: '2022',
    }
  ],
  publications: [
    {
      title: "A Trade-off Analysis of Replacing Proprietary LLMs with Open Source SLMs in Production",
      conferenceName: 'ISPASS 2024',
      journalName: '',
      authors: 'Chandra Irugalbandara, Ashish Mahendra, Roland Daynauth, Tharuka Kasthuri Arachchige, Krisztian Flautner, Lingjia Tang, Yiping Kang, Jason Mars',
      link: 'https://arxiv.org/abs/2312.14972',
      description:
        'This paper presents a systematic evaluation methodology and a characterization of modern open-source SLMs and their trade-offs when replacing proprietary LLMs for a real-world product feature. We have designed SLaM, an open-source automated analysis tool that enables the quantitative and qualitative testing of product features utilizing arbitrary SLMs.',
    },
    {
      title: 'HomeIO: Offline smart home automation system with automatic speech recognition and household power usage tracking',
      conferenceName: '2022 IEEE World AI IoT Congress (AIIoT)',
      journalName: '',
      authors: 'Chandra Irugalbandara, ASM Naseem, MSH Perera, Velmanickam Logeeshan',
      link: 'https://ieeexplore.ieee.org/abstract/document/9817282/',
      description:
        'This study presents an offline home automation system to address these difficulties. Without the internet or cloud services, the proposed home automation system can perform its essential functions. It also offers additional features like power tracking and optimization in linked devices while ensuring protection against foreign assaults and giving quick responses.'
    },
    {
      title: 'MT-LLM: LLMs are Meaning-Typed Code Constructs',
      conferenceName: 'ASPLOS 2025',
      journalName: '',
      authors: 'Jason Mars, Yiping Kang, Jayanaka Dantanarayana, Chandra Irugalbandara, Kugesan Sivasothynathan, Lingjia Tang',
      link: 'https://arxiv.org/abs/2405.08965',
      description:
        'we introduce a set of novel abstractions to help bridge the gap between Neuro- and symbolic programming. We introduce Meaning, a new specialized type that represents the underlying semantic value of traditional types (e.g., string). We make the case that GenAI models, LLMs in particular, should be reasoned as a meaning-type wrapped code construct at the language level.'
      },
  ],
  // Display articles from your medium or dev account. (Optional)
  blog: {
    source: 'dev', // medium | dev
    username: 'chandralegend', // to hide blog section, keep it empty
    limit: 2, // How many articles to display. Max is 10.
  },
  googleAnalytics: {
    id: '', // GA3 tracking id/GA4 tag id UA-XXXXXXXXX-X | G-XXXXXXXXXX
  },
  // Track visitor interaction and behavior. https://www.hotjar.com
  hotjar: {
    id: '',
    snippetVersion: 6,
  },
  themeConfig: {
    defaultTheme: 'black',

    // Hides the switch in the navbar
    // Useful if you want to support a single color mode
    disableSwitch: false,

    // Should use the prefers-color-scheme media-query,
    // using user system preferences, instead of the hardcoded defaultTheme
    respectPrefersColorScheme: false,

    // Display the ring in Profile picture
    displayAvatarRing: true,

    // Available themes. To remove any theme, exclude from here.
    themes: [
      'light',
      'dark',
      'cupcake',
      'bumblebee',
      'emerald',
      'corporate',
      'synthwave',
      'retro',
      'cyberpunk',
      'valentine',
      'halloween',
      'garden',
      'forest',
      'aqua',
      'lofi',
      'pastel',
      'fantasy',
      'wireframe',
      'black',
      'luxury',
      'dracula',
      'cmyk',
      'autumn',
      'business',
      'acid',
      'lemonade',
      'night',
      'coffee',
      'winter',
      'dim',
      'nord',
      'sunset',
      'procyon',
    ],

    // Custom theme, applied to `procyon` theme
    customTheme: {
      primary: '#fc055b',
      secondary: '#219aaf',
      accent: '#e8d03a',
      neutral: '#2A2730',
      'base-100': '#E3E3ED',
      '--rounded-box': '3rem',
      '--rounded-btn': '3rem',
    },
  },

  // Optional Footer. Supports plain text or HTML.
  footer: ``,

  enablePWA: true,
};

export default CONFIG;
