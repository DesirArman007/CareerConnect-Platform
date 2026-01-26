import { Job } from './types';

export const ALL_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Product Designer',
    company: 'Figma',
    location: 'San Francisco, USA',
    type: 'Full Time',
    salary: '$140k - $180k',
    logo: 'https://picsum.photos/100/100?random=1',
    tags: ['UI/UX', 'Figma', 'Product'],
    postedAt: '2h ago',
    department: 'Design',
    description: `
      <p>We are looking for a Senior Product Designer to join our team. You will be responsible for designing the future of our collaborative design tools.</p>
      <br/>
      <h4>What you'll do</h4>
      <p>• Lead design projects across the entire product lifecycle and multiple product launches.</p>
      <p>• Work with small multi-disciplinary teams. You'll partner closely with engineering, product, and business folks to find elegant but practical solutions to design challenges.</p>
      <p>• Be autonomous. You'll take full ownership of your work, and you take responsibility for every last detail, every step of the way.</p>
      <br/>
      <h4>Requirements</h4>
      <p>• 5+ years of experience in product design.</p>
      <p>• A portfolio showing your high quality, thoughtful UI and UX work.</p>
    `,
    applyUrl: 'https://figma.com/careers'
  },
  {
    id: '2',
    title: 'Frontend Engineer',
    company: 'Vercel',
    location: 'Remote',
    type: 'Full Time',
    salary: '$130k - $170k',
    logo: 'https://picsum.photos/100/100?random=2',
    tags: ['React', 'Next.js', 'TypeScript'],
    postedAt: '4h ago',
    department: 'Engineering',
    description: `
      <p>Vercel is looking for a Frontend Engineer to help us build the best developer experience for the web.</p>
      <br/>
      <h4>The Role</h4>
      <p>You will work on our core platform, building features that help developers deploy and scale their applications.</p>
      <br/>
      <h4>About You</h4>
      <p>• Deep understanding of React and the Web ecosystem.</p>
      <p>• Experience with Next.js is a plus.</p>
    `,
    applyUrl: 'https://vercel.com/careers'
  },
  {
    id: '3',
    title: 'AI Research Scientist',
    company: 'Google DeepMind',
    location: 'London, UK',
    type: 'Full Time',
    salary: '$180k - $250k',
    logo: 'https://picsum.photos/100/100?random=3',
    tags: ['Python', 'PyTorch', 'Gemini'],
    postedAt: '1d ago',
    department: 'Research',
    description: `
      <p>Google DeepMind is looking for an AI Research Scientist to join our team in London.</p>
      <br/>
      <h4>Responsibilities</h4>
      <p>• Conduct research in deep learning, reinforcement learning, and generative AI.</p>
      <p>• Publish papers in top-tier conferences (NeurIPS, ICML, ICLR).</p>
    `,
    applyUrl: 'https://deepmind.google/careers'
  },
  {
    id: '4',
    title: 'Staff Software Engineer',
    company: 'Linear',
    location: 'Remote',
    type: 'Full Time',
    salary: '$160k - $210k',
    logo: 'https://picsum.photos/100/100?random=4',
    tags: ['Backend', 'Node.js', 'SQL'],
    postedAt: '1d ago'
  },
  {
    id: '5',
    title: 'Brand Designer',
    company: 'Airbnb',
    location: 'New York, USA',
    type: 'Contract',
    salary: '$100k - $140k',
    logo: 'https://picsum.photos/100/100?random=5',
    tags: ['Visual', 'Brand', 'Motion'],
    postedAt: '2d ago'
  },
  {
    id: '6',
    title: 'Rust Developer',
    company: 'Rust Foundation',
    location: 'Berlin, Germany',
    type: 'Remote',
    salary: '$120k - $160k',
    logo: 'https://picsum.photos/100/100?random=6',
    tags: ['Systems', 'Rust', 'C++'],
    postedAt: '3d ago'
  },
  {
    id: '7',
    title: 'DevOps Engineer',
    company: 'Netflix',
    location: 'Los Gatos, USA',
    type: 'Full Time',
    salary: '$150k - $200k',
    logo: 'https://picsum.photos/100/100?random=7',
    tags: ['AWS', 'Kubernetes', 'CI/CD'],
    postedAt: '3d ago'
  },
  {
    id: '8',
    title: 'iOS Developer',
    company: 'Apple',
    location: 'Cupertino, USA',
    type: 'Full Time',
    salary: '$140k - $190k',
    logo: 'https://picsum.photos/100/100?random=8',
    tags: ['Swift', 'iOS', 'Mobile'],
    postedAt: '4d ago'
  },
  {
    id: '9',
    title: 'Product Manager',
    company: 'Notion',
    location: 'New York, USA',
    type: 'Full Time',
    salary: '$130k - $180k',
    logo: 'https://picsum.photos/100/100?random=9',
    tags: ['Product', 'Strategy', 'Agile'],
    postedAt: '4d ago'
  },
  {
    id: '10',
    title: 'Data Scientist',
    company: 'Spotify',
    location: 'Stockholm, Sweden',
    type: 'Remote',
    salary: '$110k - $150k',
    logo: 'https://picsum.photos/100/100?random=10',
    tags: ['Python', 'SQL', 'Machine Learning'],
    postedAt: '5d ago'
  },
  {
    id: '11',
    title: 'Security Engineer',
    company: 'Cloudflare',
    location: 'London, UK',
    type: 'Full Time',
    salary: '$120k - $170k',
    logo: 'https://picsum.photos/100/100?random=11',
    tags: ['Security', 'Network', 'Go'],
    postedAt: '5d ago'
  },
  {
    id: '12',
    title: 'Go Developer',
    company: 'Uber',
    location: 'Amsterdam, Netherlands',
    type: 'Full Time',
    salary: '$115k - $160k',
    logo: 'https://picsum.photos/100/100?random=12',
    tags: ['Go', 'Microservices', 'Backend'],
    postedAt: '6d ago'
  },
  {
    id: '13',
    title: 'Marketing Manager',
    company: 'Slack',
    location: 'San Francisco, USA',
    type: 'Contract',
    salary: '$90k - $130k',
    logo: 'https://picsum.photos/100/100?random=13',
    tags: ['Marketing', 'SaaS', 'Content'],
    postedAt: '1w ago'
  },
  {
    id: '14',
    title: 'Technical Writer',
    company: 'Stripe',
    location: 'Remote',
    type: 'Part Time',
    salary: '$60k - $90k',
    logo: 'https://picsum.photos/100/100?random=14',
    tags: ['Writing', 'Docs', 'API'],
    postedAt: '1w ago'
  },
  {
    id: '15',
    title: 'Game Developer',
    company: 'Unity',
    location: 'Montreal, Canada',
    type: 'Full Time',
    salary: '$100k - $140k',
    logo: 'https://picsum.photos/100/100?random=15',
    tags: ['C#', 'Unity', '3D'],
    postedAt: '1w ago'
  },
  {
    id: '16',
    title: 'Blockchain Developer',
    company: 'Coinbase',
    location: 'Remote',
    type: 'Full Time',
    salary: '$150k - $220k',
    logo: 'https://picsum.photos/100/100?random=16',
    tags: ['Solidity', 'Web3', 'Blockchain'],
    postedAt: '1w ago'
  },
  {
    id: '17',
    title: 'Machine Learning Engineer',
    company: 'OpenAI',
    location: 'San Francisco, USA',
    type: 'Full Time',
    salary: '$180k - $260k',
    logo: 'https://picsum.photos/100/100?random=17',
    tags: ['Python', 'TensorFlow', 'NLP'],
    postedAt: '2w ago'
  },
  {
    id: '18',
    title: 'SRE',
    company: 'Datadog',
    location: 'Paris, France',
    type: 'Full Time',
    salary: '$110k - $150k',
    logo: 'https://picsum.photos/100/100?random=18',
    tags: ['Linux', 'Python', 'Monitoring'],
    postedAt: '2w ago'
  },
  {
    id: '19',
    title: 'Android Developer',
    company: 'Samsung',
    location: 'Seoul, South Korea',
    type: 'Full Time',
    salary: '$90k - $130k',
    logo: 'https://picsum.photos/100/100?random=19',
    tags: ['Kotlin', 'Android', 'Mobile'],
    postedAt: '2w ago'
  },
  {
    id: '20',
    title: 'UI Artist',
    company: 'Epic Games',
    location: 'Cary, USA',
    type: 'Contract',
    salary: '$80k - $120k',
    logo: 'https://picsum.photos/100/100?random=20',
    tags: ['UI', 'Art', 'Design'],
    postedAt: '3w ago'
  },
  {
    id: '21',
    title: 'Full Stack Developer',
    company: 'Meta',
    location: 'Menlo Park, USA',
    type: 'Full Time',
    salary: '$160k - $220k',
    logo: 'https://picsum.photos/100/100?random=21',
    tags: ['React', 'GraphQL', 'Hack'],
    postedAt: '3w ago'
  },
  {
    id: '22',
    title: 'Cloud Architect',
    company: 'Amazon Web Services',
    location: 'Seattle, USA',
    type: 'Full Time',
    salary: '$170k - $240k',
    logo: 'https://picsum.photos/100/100?random=22',
    tags: ['AWS', 'Architecture', 'Cloud'],
    postedAt: '3w ago'
  },
  {
    id: '23',
    title: 'Cybersecurity Analyst',
    company: 'Palo Alto Networks',
    location: 'Santa Clara, USA',
    type: 'Full Time',
    salary: '$130k - $170k',
    logo: 'https://picsum.photos/100/100?random=23',
    tags: ['Security', 'Analysis', 'Network'],
    postedAt: '1mo ago'
  },
  {
    id: '24',
    title: 'Sales Engineer',
    company: 'Salesforce',
    location: 'San Francisco, USA',
    type: 'Full Time',
    salary: '$110k - $160k',
    logo: 'https://picsum.photos/100/100?random=24',
    tags: ['Sales', 'Technical', 'CRM'],
    postedAt: '1mo ago'
  },
  {
    id: '25',
    title: 'Graphic Designer',
    company: 'Adobe',
    location: 'San Jose, USA',
    type: 'Full Time',
    salary: '$90k - $130k',
    logo: 'https://picsum.photos/100/100?random=25',
    tags: ['Design', 'Creative', 'Photoshop'],
    postedAt: '1mo ago'
  },
  {
    id: '26',
    title: 'QA Engineer',
    company: 'Zoom',
    location: 'San Jose, USA',
    type: 'Full Time',
    salary: '$100k - $140k',
    logo: 'https://picsum.photos/100/100?random=26',
    tags: ['QA', 'Testing', 'Automation'],
    postedAt: '1mo ago'
  },
  {
    id: '27',
    title: 'Database Administrator',
    company: 'Oracle',
    location: 'Austin, USA',
    type: 'Full Time',
    salary: '$120k - $160k',
    logo: 'https://picsum.photos/100/100?random=27',
    tags: ['Oracle', 'SQL', 'Database'],
    postedAt: '1mo ago'
  },
  {
    id: '28',
    title: 'Network Engineer',
    company: 'Cisco',
    location: 'San Jose, USA',
    type: 'Full Time',
    salary: '$110k - $150k',
    logo: 'https://picsum.photos/100/100?random=28',
    tags: ['Network', 'Cisco', 'CCNA'],
    postedAt: '1mo ago'
  },
  {
    id: '29',
    title: 'System Administrator',
    company: 'Intel',
    location: 'Santa Clara, USA',
    type: 'Full Time',
    salary: '$100k - $140k',
    logo: 'https://picsum.photos/100/100?random=29',
    tags: ['Linux', 'Windows', 'Admin'],
    postedAt: '1mo ago'
  },
  {
    id: '30',
    title: 'IT Support Specialist',
    company: 'Microsoft',
    location: 'Redmond, USA',
    type: 'Full Time',
    salary: '$70k - $100k',
    logo: 'https://picsum.photos/100/100?random=30',
    tags: ['IT', 'Support', 'Windows'],
    postedAt: '1mo ago'
  },
  {
    id: '31',
    title: 'Research Scientist',
    company: 'NVIDIA',
    location: 'Santa Clara, USA',
    type: 'Full Time',
    salary: '$160k - $230k',
    logo: 'https://picsum.photos/100/100?random=31',
    tags: ['AI', 'GPU', 'Deep Learning'],
    postedAt: '1mo ago'
  },
  {
    id: '32',
    title: 'Social Media Manager',
    company: 'Twitter / X',
    location: 'San Francisco, USA',
    type: 'Contract',
    salary: '$80k - $120k',
    logo: 'https://picsum.photos/100/100?random=32',
    tags: ['Social Media', 'Marketing', 'Content'],
    postedAt: '1mo ago'
  }
];

export const FEATURED_JOBS = ALL_JOBS.slice(0, 6);

export const TESTIMONIALS = [
  {
    name: 'Elena Rodriguez',
    role: 'Senior Frontend Dev',
    text: '"I used to have twenty tabs open for different company career pages. Now I just come here. It’s the only workflow that makes sense."'
  },
  {
    name: 'David Kim',
    role: 'Backend Engineer',
    text: '"The one-click apply actually works. I didn\'t have to re-enter my work history ten times. I applied to five relevant roles in 15 minutes."'
  }
];
