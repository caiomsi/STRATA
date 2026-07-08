# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## What this is

STRATA — an **agency demo**: an invented quiet-luxury clothing brand. A full luxury
**e-commerce homepage** (not a checkout-complete store). Static HTML/CSS/JS, no
backend — the cart is a client-side demo only. See the root `../CLAUDE.md` for shared
conventions.

## Structure

`index.html` at root, `css/style.css`, `js/main.js`, product/editorial imagery in
`images/` (`hero.jpg`, `look-01..03.jpg`, `prod-*.jpg`, `editorial.jpg`, `material.jpg`,
`ig-1/2.jpg`, `social-share.jpg`). All imagery was generated with **Higgsfield**.

## Design language

Bone/stone/sand/charcoal quiet-luxury palette; **Fraunces + Hanken Grotesk** type
pairing. Tokens are at the top of `css/style.css`.

## Features

Announcement bar; mega-nav with search/account/bag; category tiles; product grids
with prices, 4× installment display, size-select, add-to-bag; slide-in cart drawer
(qty/remove/subtotal, **not persisted** — resets on reload, this is a demo cart);
capsule bundle section; editorial banner; Instagram feed section; rich footer.

## Contact form — wired

A contact form POSTs to the shared `MSI-Forms` backend
(`https://forms.caiomsi.com/api/submit`) from `js/main.js`. Custom domain
`strata.caiomsi.com` is planned but not yet set up — currently on
`caiomsi.github.io/STRATA`.
