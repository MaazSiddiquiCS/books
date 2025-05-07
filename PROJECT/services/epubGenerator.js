const Epub = require('epub-gen');

exports.generateEPUB = async ({ title, author, htmlContent, output }) => {
  const option = {
    title,
    author,
    output,
    content: [
      {
        title: 'Book Content',
        data: `
          <h1>${title}</h1>
          <h2>by ${author}</h2>
          ${htmlContent}
        `,
      },
    ],
  };

  return new Epub(option).promise;
};