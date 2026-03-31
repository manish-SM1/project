/**
 * Knowledge Base - Predefined Documents for RAG
 * Career guidance, technology roadmaps, and course information
 */

const knowledgeBase = [
  {
    content: `Software Engineer Career Path:
A software engineer designs, develops, and maintains software applications. Key skills include programming languages (JavaScript, Python, Java), data structures & algorithms, system design, and version control (Git).

Career Progression:
- Junior Developer (0-2 years): Focus on coding fundamentals, debugging, testing
- Mid-Level Developer (2-5 years): Feature ownership, code reviews, mentoring
- Senior Developer (5-8 years): Architecture decisions, technical leadership
- Staff/Principal Engineer (8+ years): Strategic technical direction, cross-team impact

Average Salaries (India):
- Junior: ₹3-6 LPA
- Mid-Level: ₹8-15 LPA
- Senior: ₹18-35 LPA
- Staff+: ₹40+ LPA

Prerequisites: Bachelor's in Computer Science or related field, strong problem-solving skills, portfolio of projects.`,
    metadata: { source: 'Career Guide', category: 'software-engineering', topic: 'career-path' }
  },

  {
    content: `Full-Stack Web Development Roadmap:

Month 1-2: Frontend Fundamentals
- HTML5, CSS3 (Flexbox, Grid)
- JavaScript ES6+ (async/await, promises, modules)
- Responsive design, browser DevTools

Month 3-4: Frontend Framework
- React.js: components, hooks, state management
- TypeScript basics
- Build tools: Vite, Webpack

Month 5-6: Backend Development
- Node.js + Express.js
- REST API design
- Authentication (JWT, OAuth)
- Database: PostgreSQL or MongoDB

Month 7-8: Advanced Topics
- State management: Redux/Zustand
- Testing: Jest, React Testing Library
- Deployment: Docker, CI/CD, cloud platforms (AWS/Vercel)
- Performance optimization

Projects to Build:
1. Portfolio website with blog
2. E-commerce site with cart and payment
3. Real-time chat application
4. Full-stack SaaS product`,
    metadata: { source: 'Learning Roadmap', category: 'web-development', topic: 'full-stack' }
  },

  {
    content: `Data Science Career Guide:

Required Skills:
- Programming: Python (NumPy, Pandas, Scikit-learn)
- Statistics: probability, hypothesis testing, regression analysis
- Machine Learning: supervised/unsupervised learning, model evaluation
- Data Visualization: Matplotlib, Seaborn, Tableau
- SQL for data querying
- Big Data: Spark (for advanced roles)

Learning Path (6-9 months):
1. Python fundamentals (3 weeks)
2. Statistics & probability (4 weeks)
3. Data manipulation with Pandas (3 weeks)
4. Data visualization (2 weeks)
5. Machine Learning basics (6 weeks)
6. Deep Learning introduction (4 weeks)
7. End-to-end projects (ongoing)

Project Ideas:
- Customer churn prediction
- Recommendation system
- Time series forecasting
- NLP sentiment analysis

Career Options:
- Data Analyst (entry-level)
- Data Scientist
- ML Engineer
- Research Scientist
- Data Engineer

Certifications: Google Data Analytics, IBM Data Science, Coursera ML Specialization`,
    metadata: { source: 'Career Guide', category: 'data-science', topic: 'roadmap' }
  },

  {
    content: `Python Programming Learning Path:

Beginner Level (4-6 weeks):
- Variables, data types, operators
- Control flow: if/else, loops
- Functions and modules
- Lists, dictionaries, tuples, sets
- File I/O operations
- Error handling with try/except

Intermediate Level (6-8 weeks):
- Object-oriented programming (classes, inheritance)
- List comprehensions, generators
- Decorators and context managers
- Regular expressions
- Working with APIs (requests library)
- Virtual environments and pip

Advanced Level (8-10 weeks):
- Asynchronous programming (asyncio)
- Multithreading and multiprocessing
- Testing with pytest
- Type hints and mypy
- Package development
- Performance optimization

Frameworks to Learn:
- Web: Django, Flask, FastAPI
- Data: Pandas, NumPy
- ML: Scikit-learn, TensorFlow, PyTorch
- Automation: Selenium, Beautiful Soup

Best Practices:
- Follow PEP 8 style guide
- Write unit tests
- Use version control (Git)
- Document code with docstrings
- Use virtual environments`,
    metadata: { source: 'Learning Roadmap', category: 'python', topic: 'programming' }
  },

  {
    content: `React.js Complete Guide:

Core Concepts:
- JSX: JavaScript XML syntax
- Components: functional components with hooks
- Props: passing data between components
- State: useState, useReducer
- Effects: useEffect for side effects
- Context API: global state management
- Refs: useRef for DOM access

Essential Hooks:
- useState: manage component state
- useEffect: handle side effects
- useContext: access context values
- useCallback: memoize functions
- useMemo: memoize computed values
- useRef: persist values across renders

State Management:
- Local state: useState
- Global state: Context API, Redux, Zustand, Recoil
- Server state: React Query, SWR

Routing:
- React Router v6: routes, navigation, nested routes
- Protected routes
- Dynamic routing

Best Practices:
- Keep components small and focused
- Use composition over inheritance
- Lift state up when needed
- Avoid prop drilling with Context
- Optimize re-renders with memo/useMemo
- Use TypeScript for type safety

Common Patterns:
- Custom hooks for reusable logic
- Higher-order components
- Render props
- Compound components`,
    metadata: { source: 'Tech Guide', category: 'react', topic: 'framework' }
  },

  {
    content: `Interview Preparation Guide:

Technical Interview Preparation:

1. Data Structures & Algorithms (8-12 weeks):
   - Arrays, Strings: two pointers, sliding window
   - LinkedLists: reversal, cycle detection
   - Trees: traversals, BST operations
   - Graphs: BFS, DFS, shortest path
   - Dynamic Programming: memoization, tabulation
   - Practice platforms: LeetCode, HackerRank

2. System Design (4-6 weeks):
   - Scalability concepts
   - Database design
   - Caching strategies
   - Load balancing
   - Microservices architecture
   - Case studies: design Twitter, URL shortener, etc.

3. Behavioral Questions:
   - Use STAR method (Situation, Task, Action, Result)
   - Prepare stories demonstrating:
     * Leadership
     * Conflict resolution
     * Failure and learning
     * Project ownership
   - Common questions: "Tell me about yourself", "Why this company?"

4. Domain-Specific:
   - Frontend: React lifecycle, performance optimization
   - Backend: API design, authentication, database optimization
   - DevOps: CI/CD, containerization, cloud services

Interview Process:
1. Phone screen (30 min)
2. Technical assessment (1-2 hours)
3. Onsite/Virtual (3-4 hours): coding, system design, behavioral
4. Cultural fit interview

Tips:
- Think aloud during coding
- Ask clarifying questions
- Start with brute force, then optimize
- Test your code
- Be honest about what you don't know`,
    metadata: { source: 'Career Guide', category: 'interview', topic: 'preparation' }
  },

  {
    content: `Eligibility and Prerequisites:

Software Engineering:
- Education: BE/BTech in CS/IT or equivalent
- Minimum CGPA: 7.0+ (most companies)
- No active backlogs
- Strong programming skills in at least one language
- Portfolio with 2-3 projects on GitHub
- Understanding of DSA basics

Data Science:
- Education: BE/BTech/BSc in CS, Mathematics, Statistics, or related
- Minimum CGPA: 7.5+ (competitive roles)
- Programming: Python proficiency
- Mathematics: Linear algebra, calculus, statistics
- Portfolio: Kaggle projects or GitHub repositories
- Optional: Master's degree for research roles

Web Development:
- No strict educational requirements for freelance/startup roles
- Self-taught developers accepted with strong portfolio
- Bootcamp graduates competitive
- Focus on practical projects over degrees
- Build 3-5 production-quality projects

Internship Requirements:
- Students: Generally 2nd year onwards
- CGPA: 7.0+ for competitive internships
- Domain-relevant coursework completed
- At least 1 personal project
- Resume highlighting relevant skills
- Active on LinkedIn/GitHub

Career Switching:
- 6-12 months dedicated learning
- Build portfolio of projects
- Consider bootcamps or online courses
- Network in target industry
- Start with internships if possible`,
    metadata: { source: 'Career Guide', category: 'eligibility', topic: 'prerequisites' }
  },

  {
    content: `JavaScript Modern Features and Best Practices:

ES6+ Features:
- Arrow functions: concise syntax, lexical this
- Destructuring: extract values from objects/arrays
- Template literals: string interpolation
- Spread/Rest operators: ... for arrays/objects
- Promises and async/await: asynchronous code
- Modules: import/export
- Classes: syntactic sugar over prototypes

Advanced Concepts:
- Closures: function scope and private variables
- Prototypal inheritance
- Event loop and asynchronous JavaScript
- Higher-order functions: map, filter, reduce
- Currying and partial application
- Memoization for performance

Best Practices:
- Use const by default, let when reassignment needed
- Avoid var
- Use strict equality (===)
- Handle errors with try/catch
- Avoid callback hell, use async/await
- Use meaningful variable names
- Comment complex logic
- Keep functions small and pure

TypeScript Benefits:
- Static type checking
- Better IDE support
- Catch errors at compile time
- Improved code documentation
- Easier refactoring

Common Patterns:
- Module pattern
- Observer pattern
- Factory pattern
- Singleton pattern
- Middleware pattern (Express)`,
    metadata: { source: 'Tech Guide', category: 'javascript', topic: 'programming' }
  },

  {
    content: `Cloud Computing and DevOps:

Cloud Platforms:
AWS (Amazon Web Services):
- EC2: virtual servers
- S3: object storage
- RDS: managed databases
- Lambda: serverless functions
- CloudFront: CDN
- Popular for enterprise

Azure (Microsoft):
- Strong for .NET applications
- Good for hybrid cloud
- Popular in enterprises

GCP (Google Cloud):
- Excellent for data/ML workloads
- Kubernetes (GKE) is best-in-class
- Competitive pricing

DevOps Tools:
- Version Control: Git, GitHub/GitLab
- CI/CD: Jenkins, GitHub Actions, CircleCI
- Containers: Docker, Kubernetes
- Infrastructure as Code: Terraform, Ansible
- Monitoring: Prometheus, Grafana, ELK stack
- Configuration: Chef, Puppet

Learning Path:
1. Linux fundamentals (2 weeks)
2. Git and GitHub (1 week)
3. Docker basics (2 weeks)
4. CI/CD pipelines (2 weeks)
5. Cloud platform (AWS/Azure) (4 weeks)
6. Kubernetes (4 weeks)
7. Monitoring and logging (2 weeks)

DevOps Career:
- Junior DevOps: ₹4-8 LPA
- DevOps Engineer: ₹10-18 LPA
- Senior DevOps/SRE: ₹20-40 LPA

Skills needed:
- Scripting (Bash, Python)
- Cloud platforms
- Container orchestration
- Automation mindset
- Problem-solving`,
    metadata: { source: 'Tech Guide', category: 'devops', topic: 'cloud' }
  },

  {
    content: `Machine Learning Fundamentals:

Core Concepts:
- Supervised Learning: labeled data, prediction tasks
  * Classification: binary/multiclass problems
  * Regression: continuous value prediction
- Unsupervised Learning: unlabeled data, pattern discovery
  * Clustering: K-means, hierarchical
  * Dimensionality reduction: PCA, t-SNE
- Reinforcement Learning: agent learning through rewards

Algorithm Types:
Classification:
- Logistic Regression
- Decision Trees
- Random Forest
- Support Vector Machines (SVM)
- Naive Bayes
- Neural Networks

Regression:
- Linear Regression
- Polynomial Regression
- Ridge/Lasso (regularization)

Model Evaluation:
- Train/Test split
- Cross-validation
- Metrics: accuracy, precision, recall, F1-score, ROC-AUC
- Overfitting vs underfitting
- Bias-variance tradeoff

Feature Engineering:
- Handling missing data
- Encoding categorical variables
- Feature scaling/normalization
- Feature selection
- Creating new features

Tools and Libraries:
- Python: Scikit-learn (core ML)
- Deep Learning: TensorFlow, PyTorch
- Data: Pandas, NumPy
- Visualization: Matplotlib, Seaborn

Project Workflow:
1. Problem definition
2. Data collection and exploration
3. Data preprocessing
4. Feature engineering
5. Model selection and training
6. Hyperparameter tuning
7. Evaluation
8. Deployment`,
    metadata: { source: 'Tech Guide', category: 'machine-learning', topic: 'fundamentals' }
  }
];

module.exports = knowledgeBase;
