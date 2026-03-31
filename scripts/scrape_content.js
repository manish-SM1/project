const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const COURSES = {
    'html': 'https://www.geeksforgeeks.org/html/html-tutorial/',
    'css': 'https://www.geeksforgeeks.org/css/css-tutorial/',
    'javascript': 'https://www.geeksforgeeks.org/javascript-tutorial/',
    'typescript': 'https://www.geeksforgeeks.org/typescript/typescript-tutorial/',
    'python': 'https://www.geeksforgeeks.org/python-programming-language/',
    'java': 'https://www.geeksforgeeks.org/java/',
    'c': 'https://www.geeksforgeeks.org/c/c-programming-language/',
    'cpp': 'https://www.geeksforgeeks.org/c-plus-plus/',
    'react': 'https://www.geeksforgeeks.org/reactjs/react/',
    'nodejs': 'https://www.geeksforgeeks.org/nodejs/nodejs-tutorials/',
    'django': 'https://www.geeksforgeeks.org/django-tutorial/',
    'sql': 'https://www.geeksforgeeks.org/sql/sql-tutorial/',
    'mongodb': 'https://www.geeksforgeeks.org/mongodb-tutorial/',
    'postgresql': 'https://www.geeksforgeeks.org/postgresql/postgresql-tutorial/',
    'git': 'https://www.geeksforgeeks.org/git/git-tutorial/',
    'docker': 'https://www.geeksforgeeks.org/docker/docker-tutorial/',
    'aws': 'https://www.geeksforgeeks.org/aws/aws-tutorial/'
};

const COURSE_PATH_FILTERS = {
    html: '/html/',
    css: '/css/',
    javascript: '/javascript/',
    typescript: '/typescript/',
    python: '/python',
    java: '/java/',
    c: '/c/',
    cpp: '/c-plus-plus/',
    react: '/react',
    nodejs: '/nodejs/',
    django: '/django',
    sql: '/sql/',
    mongodb: '/mongodb',
    postgresql: '/postgresql/',
    git: '/git/',
    docker: '/docker',
    aws: '/aws/'
};

const REQUEST_TIMEOUT_MS = 30000;
const MAX_TOPICS = Number(process.env.MAX_TOPICS || 0); // 0 means no cap

function isValidTopicLink(courseId, link) {
    if (!link || !link.includes('geeksforgeeks.org')) return false;
    if (link.includes('login') || link.includes('register') || link.includes('comment')) return false;

    const pathFilter = COURSE_PATH_FILTERS[courseId];
    if (!pathFilter) return true;

    return link.toLowerCase().includes(pathFilter.toLowerCase());
}

async function scrapeCourse(courseId, url) {
    console.log(`Starting scrape for ${courseId} from ${url}...`);
    try {
        const { data } = await axios.get(url, { timeout: REQUEST_TIMEOUT_MS });
        const $ = cheerio.load(data);
        const topics = [];

        // GeeksforGeeks structure often has a list of topics in a specific container
        // Targeting headers and lists
        // Note: Heuristics may need adjustment based on specific page variants

        let currentSection = 'Introduction';
        const seen = new Set();

        // Find links in the main content area
        const contentArea = $('.entry-content, .text, article, main');

        // This is a simplified scraper targeting the list of links usually found in GFG tutorials
        contentArea.find('a').each((i, el) => {
            let link = $(el).attr('href');
            const title = $(el).text().trim();

            if (link && link.startsWith('/')) {
                link = `https://www.geeksforgeeks.org${link}`;
            }

            if (title.length <= 3) return;
            if (!isValidTopicLink(courseId, link)) return;

            const key = `${title}::${link}`;
            if (seen.has(key)) return;
            seen.add(key);

            topics.push({
                title: title,
                url: link,
                section: currentSection,
                source: new URL(link).hostname
            });
        });

        if (!topics.find(t => t.url === url)) {
            topics.unshift({
                title: `${courseId.toUpperCase()} Course Introduction`,
                url,
                section: currentSection,
                source: new URL(url).hostname
            });
        }

        const topicsToFetch = MAX_TOPICS > 0 ? topics.slice(0, MAX_TOPICS) : topics;
        console.log(`Found ${topics.length} topics. Fetching ${topicsToFetch.length} topics...`);

        const detailedTopics = [];
        for (let i = 0; i < topicsToFetch.length; i++) {
            const topic = topicsToFetch[i];
            console.log(`   [${i + 1}/${topicsToFetch.length}] Fetching ${topic.title}...`);
            try {
                const topicPage = await axios.get(topic.url, { timeout: REQUEST_TIMEOUT_MS });
                const $topic = cheerio.load(topicPage.data);

                $topic('.adsbygoogle').remove();
                $topic('.side-bar').remove();
                $topic('script').remove();
                $topic('style').remove();

                let content = $topic('.text').html() || $topic('.entry-content').html() || $topic('article').html();

                if (content) {
                    let textContent = $topic('.text').text() || $topic('.entry-content').text() || $topic('article').text();
                    textContent = textContent.replace(/\s+/g, ' ').trim();
                    const plainText = textContent.substring(0, 500);

                    detailedTopics.push({
                        ...topic,
                        htmlContent: content,
                        textContent,
                        summary: plainText
                    });
                }
            } catch (e) {
                console.error(`   Failed to fetch ${topic.title}: ${e.message}`);
            }
        }

        return detailedTopics;

    } catch (error) {
        console.error(`Error scraping ${url}:`, error.message);
        return [];
    }
}

async function run() {
    const selectedCourse = (process.argv[2] || '').toLowerCase().trim();

    // Create data directory
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    const entries = Object.entries(COURSES).filter(([courseId]) => {
        if (!selectedCourse) return true;
        return courseId === selectedCourse;
    });

    if (selectedCourse && entries.length === 0) {
        console.error(`Unknown course id: ${selectedCourse}`);
        process.exit(1);
    }

    for (const [courseId, url] of entries) {
        const content = await scrapeCourse(courseId, url);
        const outFile = path.join(dataDir, `scraped_${courseId}.json`);
        fs.writeFileSync(outFile, JSON.stringify(content, null, 2));
        console.log(`Scraping complete! Saved to ${outFile}`);
    }
}

run();
