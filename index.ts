import axios from 'axios';
import cheerio from 'cheerio';

const origin = 'https://sereki-km3.shogakukan.co.jp';

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

(async () => {
    const volumes = await getVolumes();
    console.log(volumes);
})();