import axios from 'axios';
import cheerio from 'cheerio';
import fs from 'fs/promises';

const origin = 'https://sereki-km3.shogakukan.co.jp';

const sleep = (second: number) => {
    return new Promise<void>(resolve => {
        setTimeout(resolve, second * 1000);
    });
};

const getVolumes = async () => {
    const result = await axios.get(origin);
    const $ = cheerio.load(result.data);
    const volumes = $('.thumbnail > a').map((i, e) => ({
        title: e.attribs.title,
        path: e.attribs.href.replace(origin, ''),
    })).toArray();
    return new Object(volumes) as {
        title: string;
        path: string;
    }[];
};

const downloadBookPageImages = async (bookPath: string) => {
    const result = await axios.get<{
        slug: string;
        title: string;
        contents: {
            sort_no: number;
            mime_type: string;
            width: string; // numeric
            height: string; //numeric
        }[];
    }>(`${origin}${bookPath}/json`);
    const pageData = result.data;
    const slug = pageData.slug;
    await fs.mkdir(`dist/${slug}`);
    for (const page of pageData.contents) {
        const i = page.sort_no;
        const url = `${origin}/contents/${slug}/${i}/base64`;
        const base64 = (await axios.get(url)).data as string;
        const data = Buffer.from(base64.replace('data:image/jpeg;base64,', ''), 'base64');
        await fs.writeFile(`dist/${slug}/${i}.jpg`, data);
        await sleep(0.5);
        console.log(`Downloaded p. ${i} / ${pageData.contents.length}`);
    }
};

(async () => {
    const volumes = await getVolumes();
    let count = 0;
    for (const volume of volumes) {
        count += 1;
        console.log(`Start downloading Vol. ${count} / ${volumes.length}`);
        await downloadBookPageImages(volume.path);
    }
})();