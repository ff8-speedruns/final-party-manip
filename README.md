# Final Party Manipulation Tool (PC)
Final Fantasy 8. Conversion of Pingval's final party manipulation code for Playstation and awesomeWaves' modifications for PC ruby script to JS, so that it can be run on the web without requiring runners to install Ruby.

[Access the live tool](https://tools.ff8.wiki/final-party-manip)

[All tools](https://tools.ff8.wiki)

## Usage/Examples

Enter numbers, do things.  (Actual documentation TODO)

## Acknowledgements
This tool was made possible by the following people's dedicated research & code:
* [PingVal](http://pingval.g1.xrea.com/)
* [awesomeWaves](https://twitch.tv/awesomeWaves)
* [D Pad Codepen](https://codepen.io/tswone/pen/GLzZLd)

## Development

Vite + React + Mantine. Shared theme, header and app shell come from
[@ff8-speedruns/ui](https://github.com/ff8-speedruns/ff8-ui).

```bash
npm install
npm run dev      # local dev server
npm run build    # production build into dist/
npm run lint
```

Pushing to `main` builds and deploys to the `gh-pages` branch automatically.