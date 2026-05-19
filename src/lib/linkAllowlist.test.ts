/**
 * Regression tests for the chat link allowlist + sanitiser.
 *
 * The user-flagged rule: chat must NEVER link to competitors / paid services /
 * Wikipedia / blogs. Only visavu.com + verified government domains.
 *
 * Belt-and-braces: even when the prompt instructs Mistral not to invent
 * external links, sanitiseChatReply() strips anything Mistral does emit that
 * isn't on the allowlist. These tests freeze the contract.
 */
import { describe, it, expect } from "vitest";
import { isAllowedChatLink, sanitiseChatReply } from "./linkAllowlist";

describe("isAllowedChatLink — allowlist policy", () => {
  it("allows visavu.com and subdomains", () => {
    expect(isAllowedChatLink("https://visavu.com/gb/au")).toBe(true);
    expect(isAllowedChatLink("https://www.visavu.com/myths")).toBe(true);
    expect(isAllowedChatLink("https://visavu-com.translate.goog/gb/au")).toBe(true);
  });

  it("allows core .gov + .gov.* country government domains", () => {
    expect(isAllowedChatLink("https://uscis.gov/foo")).toBe(true);
    expect(isAllowedChatLink("https://www.uscis.gov/path?q=1")).toBe(true);
    expect(isAllowedChatLink("https://gov.uk/check-uk-visa")).toBe(true);
    expect(isAllowedChatLink("https://immi.homeaffairs.gov.au/visas/")).toBe(true);
    expect(isAllowedChatLink("https://www.immigration.govt.nz/")).toBe(true);
    expect(isAllowedChatLink("https://dha.gov.za/")).toBe(true);
    expect(isAllowedChatLink("https://indianvisaonline.gov.in/evisa/")).toBe(true);
    expect(isAllowedChatLink("https://moi.gov.ae/")).toBe(true);
    expect(isAllowedChatLink("https://mfa.go.kr/")).toBe(true);
    expect(isAllowedChatLink("https://mfa.gov.cn/")).toBe(true);
    expect(isAllowedChatLink("https://goc.gov.tr/")).toBe(true);
  });

  it("allows .gob.* (Spanish government variants)", () => {
    expect(isAllowedChatLink("https://exteriores.gob.es/")).toBe(true);
    expect(isAllowedChatLink("https://gob.mx/sre")).toBe(true);
    expect(isAllowedChatLink("https://argentina.gob.ar/")).toBe(true);
    expect(isAllowedChatLink("https://cancilleria.gob.ar/")).toBe(true);
  });

  it("allows .gouv.* (French government variants)", () => {
    expect(isAllowedChatLink("https://france-visas.gouv.fr/")).toBe(true);
    expect(isAllowedChatLink("https://service-public.fr/path")).toBe(true);
    expect(isAllowedChatLink("https://www.gouv.lu/")).toBe(true);
  });

  it("allows the Canada (.ca) non-.gov government domain explicitly", () => {
    expect(isAllowedChatLink("https://canada.ca/en/services/")).toBe(true);
    expect(isAllowedChatLink("https://www.canada.ca/en/immigration-refugees-citizenship/")).toBe(true);
  });

  it("allows EU institutional sites", () => {
    expect(isAllowedChatLink("https://europa.eu/")).toBe(true);
    expect(isAllowedChatLink("https://ec.europa.eu/policies/schengen/")).toBe(true);
    expect(isAllowedChatLink("https://home-affairs.ec.europa.eu/")).toBe(true);
  });

  it("allows Switzerland's admin.ch", () => {
    expect(isAllowedChatLink("https://www.admin.ch/")).toBe(true);
    expect(isAllowedChatLink("https://www.sem.admin.ch/sem/en/")).toBe(true);
  });

  it("BLOCKS competitor visa-info sites", () => {
    expect(isAllowedChatLink("https://www.immigrationboards.com/")).toBe(false);
    expect(isAllowedChatLink("https://www.workpermit.com/")).toBe(false);
    expect(isAllowedChatLink("https://www.visafirst.com/")).toBe(false);
    expect(isAllowedChatLink("https://www.expat.com/")).toBe(false);
    expect(isAllowedChatLink("https://www.iata.org/")).toBe(false);
    expect(isAllowedChatLink("https://www.henleyglobal.com/")).toBe(false);
  });

  it("BLOCKS Wikipedia, Reddit, blogs", () => {
    expect(isAllowedChatLink("https://en.wikipedia.org/wiki/Visa_policy_of_X")).toBe(false);
    expect(isAllowedChatLink("https://reddit.com/r/IWantOut/")).toBe(false);
    expect(isAllowedChatLink("https://medium.com/some-immigration-blog")).toBe(false);
  });

  it("BLOCKS paid visa services + immigration consultancies", () => {
    expect(isAllowedChatLink("https://vfsglobal.com/en/individuals/")).toBe(false);
    expect(isAllowedChatLink("https://www.gerardandkelly.com/")).toBe(false);
    expect(isAllowedChatLink("https://www.shoosmiths.com/immigration")).toBe(false);
  });

  it("rejects malformed / non-http URLs", () => {
    expect(isAllowedChatLink("javascript:alert(1)")).toBe(false);
    expect(isAllowedChatLink("file:///etc/passwd")).toBe(false);
    expect(isAllowedChatLink("not a url")).toBe(false);
  });
});

describe("sanitiseChatReply — strips non-allowlisted URLs", () => {
  it("preserves visavu.com URLs unchanged", () => {
    const input = "See https://visavu.com/gb/au for more details.";
    expect(sanitiseChatReply(input)).toContain("https://visavu.com/gb/au");
  });

  it("preserves gov URLs unchanged", () => {
    const input = "Apply via https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/work-holiday-417";
    expect(sanitiseChatReply(input)).toContain("immi.homeaffairs.gov.au");
  });

  it("strips a competitor bare URL with a marker", () => {
    const input = "Try https://www.workpermit.com/uk-work-visa for more help.";
    const out = sanitiseChatReply(input);
    expect(out).not.toContain("workpermit.com");
    expect(out).toContain("[link removed");
  });

  it("strips Wikipedia URLs", () => {
    const input = "Background: https://en.wikipedia.org/wiki/Visa_policy_of_Australia";
    const out = sanitiseChatReply(input);
    expect(out).not.toContain("wikipedia.org");
  });

  it("strips Markdown-format non-allowlisted links to label only", () => {
    const input = "More info at [WorkPermit.com guide](https://www.workpermit.com/guide).";
    const out = sanitiseChatReply(input);
    expect(out).not.toContain("workpermit.com");
    expect(out).toContain("WorkPermit.com guide");
  });

  it("preserves Markdown-format allowlisted links", () => {
    const input = "Read more at [USCIS](https://www.uscis.gov/working-in-the-united-states).";
    const out = sanitiseChatReply(input);
    expect(out).toContain("uscis.gov");
    expect(out).toContain("[USCIS]");
  });

  it("handles mixed allowed + blocked URLs in one reply", () => {
    const input = `Two routes:
- Subclass 482: https://immi.homeaffairs.gov.au/visas/482
- Random blog: https://medium.com/some-immigration-blog
Read more at https://visavu.com/gb/au/work.`;
    const out = sanitiseChatReply(input);
    expect(out).toContain("immi.homeaffairs.gov.au/visas/482");
    expect(out).toContain("visavu.com/gb/au/work");
    expect(out).not.toContain("medium.com");
  });
});
