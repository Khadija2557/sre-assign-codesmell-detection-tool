module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/analyze',
        destination: 'http://localhost:5000/api/analyze',
      },
    ];
  },
};