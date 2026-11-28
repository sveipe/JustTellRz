---
type: Playbook
title: Google Play declarations
description: Answers for the Play Console App content forms (Ads, Advertising ID, Data safety, Target audience) for Numberwright with AdMob interstitials.
tags: [store, google-play, privacy, ads, data-safety]
status: draft
stale_after: "2027-05-28"
generated:
  by: claude-code/claude-opus-5-5
  at: "2026-11-28"
---

# Where

Play Console → Numberwright → **Policy → App content**. Google checks these answers against the app's behavior, its SDKs and the [privacy policy](/store/privacy-policy.md). Missing or wrong answers can block releases.

These answers are based on what the app and the Google Mobile Ads SDK do as of the AdMob release (react-native-google-mobile-ads 17.4.0). **Check the Data safety answers against Google's own data disclosure guidance for the Google Mobile Ads SDK before submitting.** It's the authoritative list and changes between SDK versions. Review this page again by the `stale_after` date or after any SDK upgrade.

# 1. Ads

* Does your app contain ads? **Yes.** This adds the "Contains ads" label to the store listing.

# 2. Advertising ID

The APK includes `com.google.android.gms.permission.AD_ID`, added by the AdMob SDK.

* Does your app use advertising ID? **Yes.**
* Purposes: **Advertising or marketing**, **Analytics**, **Fraud prevention, security, and compliance**.

# 3. Data safety

Game stats and settings never leave the device (see [Persistence](/architecture/persistence.md)), so they aren't declared. Everything declared comes from the AdMob SDK:

| Data type (Play category) | Collected | Shared | Purposes | Optional? |
| --- | --- | --- | --- | --- |
| Device or other IDs: advertising ID | Yes | Yes (Google) | Advertising or marketing, Analytics, Fraud prevention | No |
| App activity: app interactions (ads viewed, tapped) | Yes | Yes (Google) | Advertising or marketing, Analytics | No |
| App info and performance: crash logs, diagnostics | Yes | No | Analytics, Fraud prevention | No |
| Location: approximate location (derived from IP address) | Yes | Yes (Google) | Advertising or marketing, Fraud prevention | No |

Security practices section:

* Is all collected data encrypted in transit? **Yes.** The SDK uses HTTPS.
* Do you provide a way for users to request that their data be deleted? **Yes.** By email to info@justtell.co, as the privacy policy says. Device data is deleted by uninstalling.
* Independent security review: **No**, unless one is done.

Personalization is consent-based in the EEA, the UK and Switzerland, and players can limit it through device settings everywhere. See [Consent](/ads/consent.md). That doesn't change the answers above: the data is still collected.

# 4. Target audience and content

* Target age groups: **16–17 and 18+ only.** This matches the privacy policy, which says JustTell's services aren't directed at children under 16.
* Selecting younger age groups brings in Google Play's Families policy. That needs Families-certified ad settings (child-directed ad requests) and different policy text, so it's a separate project.

# 5. Other App content items

* **Privacy policy URL:** https://www.justtell.co/privacy
* **Data deletion:** the same answer as Data safety, by email.
* **Content rating questionnaire:** a puzzle game with no violence, user content, gambling or purchases. Answer it honestly. Ads appear in the rating summary.
