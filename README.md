# Nexus Clash — how to edit your game

Nexus Clash is a mobile card battler in the style of Marvel Snap. The whole game is one file, `index.html`. Everything you'll want to change (cards, locations, packs, prices) is in a clearly marked block at the very top of that file.

```
nexus-clash/
├── index.html        ← the game (open it in a browser to play)
├── card-maker.html   ← tool for making cards and locations with your own pictures
├── README.md         ← this guide
└── images/           ← optional: put picture files here
```

**What you need:** any text editor. Notepad (Windows), TextEdit (Mac, set to plain text), or the free [VS Code](https://code.visualstudio.com) all work. VS Code is the nicest because it colours the code and shows line numbers.

**The editing loop:** open `index.html` in your editor, change something, save, then refresh the game in your browser.

---

## 1. Add a card

Open `index.html`. Near the top you'll find `const CARDS = [`. Each line inside it is one card:

```js
{ id:"ironcub", name:"Iron Cub", cost:2, power:3, rarity:"common", emoji:"🐻", color:"#d5812f", image:"" },
```

To add your own:

1. Copy any card line, from `{` to `},` (keep the comma at the end).
2. Paste it on a new line inside the list, before the `];`.
3. Change the values, and give it an `id` no other card uses.
4. Save and refresh.

New cards show up in packs and the shop automatically. To give a card to new players from the start, add its id to `STARTER_CARDS` (see section 5).

### Card fields

| Field | What it does | Example |
|---|---|---|
| `id` | Unique code name. Letters, numbers, `-` and `_` only. Players never see it. | `"firehawk"` |
| `name` | The name on the card | `"Fire Hawk"` |
| `cost` | Energy to play it, 0 to 6 | `3` |
| `power` | Starting power | `4` |
| `rarity` | `"common"`, `"rare"`, `"epic"` or `"legendary"` | `"rare"` |
| `emoji` | Picture shown when there's no image | `"🦅"` |
| `color` | Card background colour | `"#e8323c"` |
| `image` | Your picture (see section 3). `""` means none. | `"images/firehawk.png"` |
| `imagePos` | *Optional.* Which part of a picture to keep when it's cropped | `"50% 20%"` |
| `ability` | *Optional.* What the card does (see below) | `{ effect:"draw", amount:1 }` |
| `text` | *Optional.* Your own wording for the ability. Normally it's written for you. | `"Draw a card. Obviously."` |
| `token` | *Optional.* `true` means other cards create it, and it never appears in packs | `true` |

### Card abilities

Write an ability as `ability:{ effect:"NAME", amount:NUMBER }`. The text on the card is written automatically, so it always matches what the card really does.

**On Reveal** effects happen once, when the card flips face up:

| Effect | What it does |
|---|---|
| `buffAlliesHere` | Your other cards at this location get +amount Power |
| `debuffEnemiesHere` | Enemy cards here get −amount Power |
| `draw` | Draw *amount* cards |
| `energyNext` | +amount Energy next turn |
| `buffHand` | Cards in your hand get +amount Power |
| `summon` | Puts a token at another location. Use `token:"id"` instead of amount. |
| `addCard` | Adds a card to your hand. Use `card:"id"` instead of amount. |
| `ifAlone` | +amount Power if it's your only card here |
| `perAlly` | +amount Power for each of your other cards here |
| `finalTurn` | +amount Power if played on the final turn |
| `destroyWeakest` | Destroys the enemy card here with the least Power (no amount) |
| `buffRandomAlly` | Another random card of yours gets +amount Power |

**Ongoing** effects are active the whole time the card is on the board:

| Effect | What it does |
|---|---|
| `auraAlliesHere` | Your other cards here have +amount Power |
| `auraEnemiesHere` | Enemy cards here have −amount Power |
| `auraAlliesEverywhere` | All your other cards have +amount Power |
| `locationBonus` | +amount to your total Power at this location |

**End of turn:**

| Effect | What it does |
|---|---|
| `grow` | This card gains +amount Power at the end of every turn |

Examples:

```js
{ id:"medic",   name:"Field Medic", cost:2, power:1, rarity:"rare", emoji:"🩹", color:"#3aa876", image:"", ability:{ effect:"buffAlliesHere", amount:2 } },
{ id:"cloner",  name:"Cloner",      cost:3, power:2, rarity:"epic", emoji:"🧬", color:"#7a3fe0", image:"", ability:{ effect:"summon", token:"clone" } },
{ id:"clone",   name:"Clone",       cost:1, power:3, rarity:"common", emoji:"👤", color:"#7a3fe0", image:"", token:true },
```

---

## 2. Add a location

Find `const LOCATIONS = [` just below the cards. Locations work the same way, except they have an `effect` and `amount` instead of cost and power:

```js
{ id:"peak", name:"Storm Peak", emoji:"⛈️", color:"#304bcf", image:"", effect:"closeAfter", amount:4 },
```

| Effect | What it does |
|---|---|
| `none` | No effect |
| `playBonus` | Cards played here get +amount Power. Use a minus number for a penalty. |
| `capacity` | Each side can only have *amount* cards here (normally 4) |
| `costReduction` | Cards cost *amount* less to play here |
| `closeAfter` | Closed after turn *amount*. Nothing can be played, moved or summoned here after that. |
| `doubleReveal` | On Reveal abilities here happen twice |
| `bigBonus` | Cards that cost 5 or more have +amount Power here |
| `smallOnly` | Only cards that cost *amount* or less can be played here |
| `recruit` | Every turn, both players get a Recruit card (keep the `recruit` token in CARDS) |
| `drawOnPlay` | When a card is played here, its owner draws a card |
| `growHere` | At the end of every turn, cards here get +amount Power |
| `energyWinner` | Whoever is winning here gets +amount Energy each turn |
| `underdog` | The side with fewer cards here (at least 1) gets +amount Power |

About `closeAfter`: `amount:4` means you can play cards there on turns 1, 2, 3 and 4. On turn 4 the location shows a "Last turn here" tag. On turns 5 and 6 it shows a lock, and dragging a card there is refused with "Closed after turn 4". The computer opponent follows the same rule.

Each match picks 3 random locations from the list, so keep at least 3.

---

## 3. Use your own pictures

Any picture works on a card or location. It's cropped to fill the space automatically, so it never stretches or leaves gaps. There are two ways to add one.

### Option A: Card Maker (easiest, works everywhere)

1. Open `card-maker.html` in your browser.
2. Pick **Card** or **Location** and fill in the details. The preview updates as you type.
3. Choose a picture, then drag it to position it and use the zoom slider (or pinch on a phone). On cards, the striped strip at the bottom shows where the name bar will cover.
4. Press **Copy code** and paste the line into `CARDS` or `LOCATIONS`.

The picture is stored inside the line itself (the long `data:image/...` text), so there are no files to keep track of. This also works on the published claude.ai link. Pictures are saved at 360×480 for cards and 480×360 for locations. Transparent PNGs keep their transparency, so a cut-out character sits on top of the card colour.

To change an existing card, paste its line into **Edit an existing one** at the bottom of the Card Maker.

### Option B: picture files

1. Put the picture in the `images` folder, e.g. `images/firehawk.png`.
2. Set `image:"images/firehawk.png"` on the card.

For best results, use a tall picture (3:4, like 600×800) for cards and a wide one (4:3) for locations. If the crop cuts off the wrong part, add `imagePos`, for example `imagePos:"50% 10%"` keeps the top of the picture.

Picture files only work when the game runs from its folder (on your computer, or hosted on a site like itch.io or Netlify). The published claude.ai link can't load separate files, so use Option A for that.

If a picture can't be found, the game shows the card's emoji and a message naming the card.

---

## 4. If something goes wrong

The game checks your cards and locations every time it starts.

- **Small mistakes** (a misspelled effect, an unknown rarity, a duplicate id) show a red box listing exactly what to fix. The game still runs and skips or repairs the broken part.
- **Typos that break the code** (a missing comma, quote mark or bracket) show a "The game couldn't start" screen with the line number. Check that line and the one just above it. The most common cause is a missing comma at the end of the previous card.

Quick checklist:

- Every card line ends with `},`
- Text values are in straight double quotes: `"like this"`, not “curly quotes”
- Numbers have no quotes: `cost:3`, not `cost:"3"`
- Each `id` is used only once

---

## 5. Shop, starter and reward settings

Below the locations you'll find:

| Setting | What it controls |
|---|---|
| `RARITIES` | Shop price and the gold you get for a duplicate, per rarity |
| `PACKS` | Pack names, number of `cards`, `price`, rarity `odds` (percentages) and an optional `guarantee` |
| `BUNDLES` | Ready-made 12-card decks sold in the shop. The computer opponent also plays these. |
| `STARTER_CARDS` | Cards a new player owns |
| `STARTER_DECK` | A new player's first deck (exactly 12 ids) |
| `SETTINGS` | Game title, starting gold, daily gift gold, and the price to refresh the shop's daily cards |
| `OPPONENTS` | Names and emojis for computer opponents |

The deck builder only allows one copy of each card, so keep at least 12 collectible cards in `CARDS`.

**Testing tip:** progress is saved in your browser. After changing starter cards or gold, use ⚙️ Settings → **Reset all progress** to start fresh and see your changes.

---

## 6. How a match works

- There are 3 locations and 6 turns. Win 2 of the 3 locations; if that's tied, total Power decides.
- Each turn you get Energy equal to the turn number.
- You start with 3 cards and draw 1 each turn. Decks have 12 cards and hands hold up to 7.
- Locations are revealed one per turn on turns 1–3.
- Both players play at the same time. Whoever is winning more locations reveals their cards first.
- You can drag a played card to another location, or back to your hand, until you press **End Turn**.
- Cubes are your rank stakes. **Blitz** doubles them from the next turn, and **Retreat** ends the match early, losing only the current stakes. Stakes double again at the end of the match.

---

## 7. Screens

Swipe left or right (or tap the bar at the bottom) to move between the three screens:

**Decks** ← **Home** → **Shop**

- **Home:** the logo, your gold and settings along the top, and your rank card with win/loss record. The daily gift pops up just below the rank card only while it's waiting to be claimed. The bar at the bottom works like Marvel Snap's: your deck on the left (tap to switch decks), **Play** in the middle, and your rank with cube progress on the right (tap for details).
- **Decks:** laid out like Marvel Snap's deck editor. The deck you're editing sits in a compact strip at the top (tap a card to remove it), and the rest of the screen is your collection (tap a card to add it). ☰ switches decks or makes a new one, tapping the name renames it, and ⋯ has auto-fill, clear and delete. The floating buttons sort the collection (cost, power, name, rarity) and filter it (cost, rarity, cards you don't own yet).
- **Shop:** card packs, today's cards and deck bundles.

During a match, the opponent's Energy shows next to their hand and deck counts, and turns green when they have bonus Energy. Tap their name, or your own Energy orb, to see exactly where each point came from (the turn number, cards like Night Owl, or locations like Ley Nexus).

## 8. Sharing

- **Easiest:** share the published claude.ai link.
- **Your own web link:** upload the whole folder to [itch.io](https://itch.io) (as an HTML game, zipped) or drag it onto [Netlify Drop](https://app.netlify.com/drop). Picture files in `images/` work there too.
- **Send the file:** `index.html` runs on any computer by double-clicking it. Include the `images` folder if you use picture files.

Each player's progress is saved on their own device.
# NexusClash
