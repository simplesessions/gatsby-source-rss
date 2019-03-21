const parser = require('rss-parser');
const crypto = require('crypto');

const createContentDigest = obj => crypto
  .createHash('md5')
  .update(JSON.stringify(obj))
  .digest('hex');

function promisifiedParseURL(url) {
  return new Promise((resolve, reject) => {
    parser.parseURL(url, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data.feed);
    });
  });
}

const createChildren = (entries, parentId, createNode) => {
  const childIds = [];
  entries.forEach((entry) => {
    childIds.push(entry.guid);
    const node = Object.assign({}, entry, {
      id: entry.guid,
      title: entry.title,
      link: entry.guid,
      description: entry.description,
      parent: parentId,
      children: [],
    });
    node.internal = {
      type: 'rssFeedItem',
      contentDigest: createContentDigest(node),
    };
    createNode(node);
  });
  return childIds;
};

const configureFeedStory = (data) => {};

async function sourceNodes({ boundActionCreators }, { rssURL }) {
  const { createNode } = boundActionCreators;
  const data = await promisifiedParseURL(rssURL);
  if (!data) {
    return;
  }
  const {
    title, description, link, entries,
  } = data;
  const childrenIds = createChildren(entries, link, createNode);
  const feedStory = Object.assign(
    {
      id: link,
      title,
      description,
      link,
      parent: null,
      children: childrenIds,
    },
    data,
  );

  feedStory.internal = { type: 'rssFeed', contentDigest: createContentDigest(feedStory) };

  createNode(feedStory);
}

exports.sourceNodes = sourceNodes;
