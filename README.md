# Miniflux Tweaks

A userscript to add quality-of-life improvements to self-hosted [Miniflux](https://miniflux.app/) feed reader interfaces.

## Features

### Quick Sort Toggle
Adds a dropdown to feed pages that lets you switch between "Newest first" and "Oldest first" entry sorting without navigating to settings.

### Self-Hosted Friendly
- Domain-agnostic, configures itself on first run
- API token stored locally in userscript manager storage
- No external dependencies

## Installation

### Prerequisites
- A userscript manager: [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
- A self-hosted Miniflux instance with API access enabled

### Install Steps

1. Install Tampermonkey or Violentmonkey in your browser
2. Click here to install: [miniflux-tweaks.user.js](https://raw.githubusercontent.com/hjdarnel/miniflux-tweaks/main/miniflux-tweaks.user.js)
3. Navigate to your Miniflux instance
4. Click "OK" when prompted to configure the script for this domain
5. Go to **Settings** and scroll to the bottom
6. In the "Miniflux Tweaks" section, paste your API token and click "Update"

### Getting Your API Token

1. In Miniflux, go to **Settings → API Keys**
2. Click "Create a new API key"
3. Copy the generated token

## Usage

Once configured, you'll see a sort dropdown on any page with entries:
- `/unread`
- `/starred`
- `/history`
- `/feed/*/entries`
- `/category/*/entries`

Select "↓ Newest" or "↑ Oldest" to change the sort order. The page reloads to reflect the new order.

## Troubleshooting

**Dropdown is disabled**
- Check that you've set your API token in Settings → Miniflux Tweaks
- Verify the token is valid (try regenerating it)

**Script doesn't appear on my Miniflux instance**
- Make sure you clicked "OK" on the domain configuration prompt
- If you dismissed it, visit Settings and use "Reset Domain" to re-trigger the prompt

**"Reset Domain" button**
- Use this if you move your Miniflux to a new domain or want to use the script on a different instance

## Development

```bash
# Clone the repo
git clone https://github.com/hdarnell/miniflux-tweaks.git

# Make changes to miniflux-tweaks.user.js
# Then copy/paste into your userscript manager, or use a local file loader
```

## License

MIT
