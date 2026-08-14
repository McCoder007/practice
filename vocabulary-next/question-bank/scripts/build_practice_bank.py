#!/usr/bin/env python3
"""Build staging, shipped practice JSON, id-map, manifest, ledger, and review HTML."""

from __future__ import annotations

import json
import random
import re
import subprocess
import sys
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from extract_practice_sources import extract_all
from practice_lib import (
    ARCHIVE_BANK,
    BOOK_COMPREHENSIVE,
    BOOK_NAIL_TEST,
    BOOK_THEORY_UPDATE,
    GLOSSARY_PATH,
    PRACTICE,
    REPORTS,
    REVIEW,
    ROOT,
    SCRIPT_VERSION,
    SOURCE_FILES,
    SOURCE_TITLE,
    SOURCES,
    content_hash,
    normalize_identity,
    sha256_file,
)

FILE_ORDER = (BOOK_NAIL_TEST, BOOK_THEORY_UPDATE, BOOK_COMPREHENSIVE)
TEACHING_COPY_PATH = PRACTICE / "teaching-copy.json"
CALIBRATION_PATH = PRACTICE / "calibration-set.json"
BATCHES_PATH = PRACTICE / "batches"
REVIEW_DECISIONS_PATH = REPORTS / "review-decisions.json"
REVIEW_REASONS_PATH = PRACTICE / "review-reasons.json"
HELD_QUESTIONS_PATH = PRACTICE / "questions-to-review.json"
PASS_STATUSES = {
    "answerReviewStatus",
    "teachingCopyStatus",
    "englishReviewStatus",
    "chineseReviewStatus",
}
RESOLUTION_OUTCOMES = {"source-key-confirmed", "learner-answer-corrected", "omitted"}
SOURCE_WARNING = {
    "en": "This card preserves the original source answer, but its wording or answer conflicts with the textbook or current safety guidance.",
    "zh": "本题保留原始资料答案，但题目措辞或答案与教材或当前安全规范存在冲突。",
}
KNOWN_QUARANTINE = {
    "practice-nail-test-n011": ("The keyed 'pleasing personality' is subjective, culturally loaded, and not a measurable requirement for student success. It cannot support fair educational review."),
    "practice-comprehensive-006": ("The EXCEPT item says emphasizing work ethic and hygiene is not a step for avoiding social-media mistakes. That answer is unrelated to the other platform-safety actions and does not teach one clear rule."),
    "practice-comprehensive-011": ("The source presents lack of water as the universal number-one cause of daytime fatigue. Fatigue has many medical and lifestyle causes, and the exact ranking is unsupported."),
    "practice-comprehensive-034": ("The item gives U.S. tax and Social Security benefit advice without jurisdiction, employment status, or current-law context. This legally and financially sensitive claim requires current specialist review."),
    "practice-comprehensive-164": ("The stem depends on the culture-specific idiom 'glass as half full.' The item tests English figurative language more than professional knowledge and is unsuitable for the ESL teaching pool."),
    "practice-comprehensive-172": ("The source says distributor sales consultant is least satisfying for someone who enjoys training. Distributor educators and sales consultants often teach products, so the key is not uniquely defensible."),
    "practice-nail-test-q021": ("The source gives a universal 60-degree angle for filing nail corners. Filing direction and shape vary by desired nail shape; the textbook does not support this exact rule."),
    "practice-nail-test-q023": ("The phrase 'file metal tips for paper files' does not identify a recognized implement or procedure. The keyed 'nail tip file' does not resolve the damaged stem."),
    "practice-nail-test-q025": ("The source question asks what must happen before tools are used on another client, but the keyed answer repeats 'used on another client' and supplies no safety action."),
    "practice-nail-test-q063": ("The source recommends checking nail strength by pressing at the tip without defining natural or enhanced nails, safe pressure, or the stress area. The procedure is too vague."),
    "practice-nail-test-q065": ("Cuticle oil can improve flexibility and dryness but does not treat or repair a split nail. The word 'treat' overstates what the product can do."),
    "practice-nail-test-q096": ("The stem asks which type of light can be used for treatment but keys 'light therapy,' which is the treatment category rather than a type of light."),
    "practice-nail-test-q119": ("The source recommends a cotton-tipped wooden stick to clean under nail tips. Current procedure favors washing with a nail brush or an appropriate blunt implement; fibers can remain behind."),
    "practice-nail-test-q120": ("Short round nails do not uniquely require a French tip design. This is a style preference, not a technical suitability rule."),
    "practice-nail-test-q126": ("The source recommends a cotton-tipped stick for cleaning nail tips without identifying the service or material. The procedure is not uniquely safe or supported."),
    "practice-nail-test-q196": ("The phrase 'working next to the nail' does not identify the sidewall, skin, or enhancement surface, so the keyed 45-degree electric-file angle cannot be applied safely."),
    "practice-nail-test-q202": ("Disinfecting a client's hands after a service is not inherently the single incorrect action. The stem supplies no complete post-service sequence or useful unique contrast."),
    "practice-nail-test-n002": ("Cleaning before an enhancement helps remove many contaminants but does not guarantee prevention of fungus. The source teaches an overconfident medical outcome."),
    "practice-nail-test-n032": ("The source uses the older term nail mantle for the deep fold holding the root. Current terminology uses proximal nail fold and matrix-area structures."),
    "practice-nail-test-n040": ("The source relies on the outdated nail mantle term and answers only 'base of the nail,' which is too imprecise to identify root and matrix anatomy."),
    "practice-nail-test-n041": ("The question treats mantle as a recognized alternative among three main natural-nail parts. Current textbook anatomy uses more specific structures and does not support this classification."),
    "practice-comprehensive-152": ("The source keys ohms for electrical current. Current is measured in amperes; ohms measure resistance, so the keyed answer is incorrect."),
    "practice-comprehensive-153": ("The stem misspells watts as 'Walts.' Although the definition describes watts, source custody forbids silently repairing the tested term."),
    "practice-nail-test-q052": ("The source equates sodium hypochlorite with either floor cleaner or bleach. It is the active chemical in chlorine bleach, but not every floor cleaner is sodium hypochlorite."),
    "practice-nail-test-q125": ("The source says bacteria invade living organisms 70 percent of the time without illness and calls them symbiotic. The percentage and use of 'invade' are unsupported and biologically misleading."),
    "practice-nail-test-n018": ("The key uses the outdated lay phrase 'blood poisoning' as a general infection. This may refer to sepsis or bloodstream infection, which are distinct medical conditions."),
    "practice-nail-test-n020": ("The source calls a 1,000 ppm quaternary ammonium solution a wet sanitizer. Product concentration and contact time must follow the current label; this old generic rule is unsafe."),
    "practice-nail-test-n021": ("The source recommends 70 percent methyl alcohol for sharp tools. Current salon practice requires cleaning and an EPA-registered disinfectant; methanol is toxic and not an acceptable generic implement disinfectant."),
    "practice-nail-test-n023": ("The source uses perionychium as the skin surrounding the nail. Current textbook terminology identifies specific nail folds, eponychium, and hyponychium and does not use this term."),
    "practice-nail-test-n027": ("The source recommends 3 percent hydrogen peroxide for a small cut. Current exposure procedures use washing, antiseptic offered to the client, and a bandage; peroxide is not the first universal rule."),
    "practice-theory-update-023": ("The source requires blood-contaminated metal tools to be sterilized before reuse. Milady requires proper cleaning and EPA-registered disinfection; sterilization requirements depend on jurisdiction and equipment."),
    "practice-comprehensive-123": ("The keyed term 'Pediculous capitis' is misspelled. The recognized condition is pediculosis capitis, and the damaged key should not be silently corrected in source custody."),
    "practice-nail-test-q024": ("The source says the liver discharges waste containing bile. The liver produces bile, the gallbladder stores it, and the intestine eliminates waste; the stem combines different functions."),
    "practice-nail-test-q144": ("The stem combines gliding with tapping but keys a misspelled effleurage. Effleurage is gliding; tapping is tapotement, so two different movements are mixed together."),
    "practice-comprehensive-175": ("The source asks which body system is least important for a nail technician. Relative importance is subjective and does not create a unique factual answer."),
    "practice-comprehensive-075": (
        "The keyed statement says pressing down always increases machine speed. That behavior applies only to a "
        "particular variable-speed foot control, not to every electric file or handpiece control."
    ),
    "practice-nail-test-q027": ("The source recommends UV gel for a client allergic to acrylic liquid. Many acrylic and gel systems share methacrylate allergens, so substitution without medical/product-specific guidance is unsafe."),
    "practice-nail-test-q029": ("The keyed cause 'incorrect usage of the UV light' is too vague and the symptom description does not identify a unique product, lamp, curing-time, or application error."),
    "practice-nail-test-q038": ("The source recommends reducing lamp time to reduce heat. Shortening required cure time can leave gel undercured and increase allergy and service-breakdown risk."),
    "practice-nail-test-q051": ("The source says gel on a broken acrylic nail should be thicker from base to tip. Proper structure requires controlled thickness in the stress area, not uniform thick product across the nail."),
    "practice-nail-test-q056": ("The client asks for no artificial nails, but the source recommends builder gel, which is an enhancement product. The answer conflicts with the client's stated choice."),
    "practice-nail-test-q059": ("The instruction to attach fake nails 'securely under the tip of the natural nail' does not describe a recognized tip, form, or full-cover application and could place product incorrectly."),
    "practice-nail-test-q090": ("The key 'incorrect polymer ratio' does not state whether the bead was too wet or too dry and cannot uniquely explain a crack in the middle of an enhancement."),
    "practice-nail-test-q093": ("The keyed placement 'at the tip's edge and the stopping point at the nail tip' is unclear and does not identify the contact area, stop point, or sidewall fit safely."),
    "practice-nail-test-q099": ("The source treats all gel nails as acetone soak-off products. Hard gels must be filed off, so foil-and-acetone removal is not a safe generic instruction."),
    "practice-nail-test-q104": ("Calling stiletto the universally weakest shape ignores length, product, apex, and structure. The textbook does not support one shape as uniquely weakest in every case."),
    "practice-nail-test-q113": ("A heat spike can result from thick product, damaged nails, lamp mismatch, or curing chemistry. 'Lamp on too long' is not a unique or sufficiently safe diagnosis."),
    "practice-nail-test-q127": ("The source explains roughness only as 'incorrect filing technique' without identifying pressure, bit, angle, grit, or movement. The key is too vague to teach."),
    "practice-nail-test-q128": ("The source says gel polish protects color without a UV lamp. Gel polish requires the matching UV or LED curing lamp, so the key is chemically incorrect."),
    "practice-nail-test-q142": ("Recommending UV gel for an acrylic-liquid allergy is unsafe because both systems may contain related methacrylates that can trigger the same allergy."),
    "practice-nail-test-q152": ("The instruction to apply acrylic 'at the point of attachment' does not identify a safe location or procedure for a bitten nail and cannot support one unique answer."),
    "practice-nail-test-q154": ("Naturally curved, long nails do not uniquely require UV gel. Product choice depends on the client's goal and nail condition, which the stem does not provide."),
    "practice-nail-test-q155": ("A flat, smooth nail does not uniquely require builder gel. The desired service and structural need are missing, so several products could be appropriate."),
    "practice-nail-test-q165": ("Full-cover nails are not universally the easiest artificial nails to remove; removal depends on the adhesive and product chemistry."),
    "practice-nail-test-q197": ("The source uniquely blames too much adhesive for a cracked tip. Cracks can result from sizing, fit, impact, structure, or adhesive use, and the stem gives no diagnostic evidence."),
    "practice-nail-test-q203": ("The source says the FDA prohibits MMA in nail products. FDA enforcement history and state bans are more nuanced; the agency has not issued the simple universal prohibition claimed."),
    "practice-nail-test-q204": ("The source says a nail tip is placed at the arch of the nail. Tips attach at their contact area and stop point; the arch is not the universal placement location."),
    "practice-nail-test-n003": ("The source says polyester resin is the ingredient in every top coat. Top-coat formulas vary and the textbook does not support one universal resin ingredient.")
  ,
    "practice-nail-test-q009": (
        "The source answer is sensible general hygiene, but the textbook does not support the specific work-desk "
        "rule and the item cannot add a non-restating teaching fact from the available authority."
    ),
    "practice-nail-test-q012": (
        "The source says all gel nails are removed by soaking in acetone. Soak-off gels may be soaked, but hard gels "
        "must be filed off, so the generic key is unsafe."
    ),
    "practice-nail-test-q058": (
        "The source gives one universal rinse-dry-dispose rule for empty chemical containers. Disposal must follow "
        "the product label and local requirements; some containers should not be rinsed."
    ),
    "practice-nail-test-q070": (
        "The source equates a chemical smell with fumes. Odor alone does not identify fumes or exposure level, and "
        "the textbook defines fumes more specifically than a smell in the room."
    ),
    "practice-nail-test-q121": (
        "The stem asks for one chemical solution but the key combines disinfectants for surfaces with antiseptics for "
        "skin. These are different product categories, so there is no single keyed answer."
    ),
    "practice-nail-test-q143": (
        "The source says acrylic primer is methacrylic acid. Acid-based primers may contain methacrylic acid, but "
        "nonacid and acid-free primers also exist, so the generic statement is false."
    ),
    "practice-nail-test-q171": (
        "The source says methacrylic acid is the main ingredient in primer. This applies only to acid-based primers; "
        "the textbook describes nonacid and acid-free primers as well."
    ),
    "practice-nail-test-q189": (
        "The stem asks for a chemical reaction that accelerates but keys catalyst. A catalyst is a substance that "
        "speeds a reaction, not a reaction itself, so the grammar changes the scientific meaning."
    ),
    "practice-comprehensive-140": (
        "The source gives an exact count of 98 elements occurring naturally on Earth. The boundary depends on how "
        "trace and short-lived elements are classified, so this unsupported exact figure is not safe to teach."
    ),
    "practice-comprehensive-143": (
        "The source asks for a compound molecule but keys exposed metal rusting. Rusting is a chemical reaction; it "
        "is not itself an example of a compound molecule."
    ),
    "practice-nail-test-q006": (
        "The source says to finish a gel service by applying nourishing oil to the client's hands. Gel procedures "
        "typically apply cuticle oil to surrounding skin; the keyed body location and product are too vague."
    ),
    "practice-nail-test-q037": (
        "The source says the first pedicure step is to put on gloves and ask the client to wash their hands. The "
        "textbook pre-service sequence requires technician hand washing and does not support this combined first step."
    ),
    "practice-nail-test-q043": (
        "The keyed advice to recommend polish that 'suits their nails' is subjective and gives no condition, product "
        "property, or unique educational fact to review."
    ),
    "practice-nail-test-q122": (
        "The source says to assess a bandaged finger but does not define whether the wound is open, infected, or safe "
        "to expose. Removing or inspecting a client's bandage is outside a clear salon safety procedure."
    ),
    "practice-nail-test-n028": (
        "The source answer is damaged ('on a most nail bed') and incorrectly places a metal pusher on the nail bed. "
        "A pusher is used gently and nearly flat on the nail plate, not living nail-bed tissue."
    ),
    "practice-nail-test-n036": (
        "The source keys the obsolete phrase 'scarf skin' as another name for cuticle. Current textbook terminology "
        "defines cuticle as dead tissue attached to the nail plate and does not use this synonym."
    ),
    "practice-comprehensive-050": (
        "The source presents eczema and dermatitis as separate conditions with a fixed symptom contrast. Eczema is "
        "a form of dermatitis, and the textbook does not support this as a reliable either-or distinction."
    ),
    "practice-comprehensive-051": (
        "The source keys cheeks as the face area where nail technicians are most likely to experience skin allergies. "
        "The textbook discusses product allergy and exposure but does not support this unique body-location claim."
    ),
    "practice-comprehensive-186": (
        "The source repeats the healthy-skin question with misspellings in both the stem and keyed choice ('sin' and "
        "'regid'). The clean duplicate comprehensive-048 is retained, so this damaged version is quarantined."
    ),
    "practice-nail-test-q049": (
        "The source treats hypertrophy as another name for onychauxis. Hypertrophy is a general increase in tissue "
        "size, while onychauxis specifically describes abnormal nail thickening; they are not safe synonyms."
    ),
    "practice-nail-test-n004": (
        "The source keys onychia for inflammation with pus, redness, and swelling. Milady defines onychia as matrix "
        "inflammation with nail shedding, while pus and surrounding-tissue inflammation point toward paronychia."
    ),
    "practice-nail-test-n058": (
        "The source says the nail body is attached to skin at the fingertip. The nail plate rests on the nail bed and "
        "its free edge extends beyond the fingertip, so the keyed wording is anatomically misleading."
    ),
    "practice-theory-update-024": (
        "The source says putting on gloves is the first action after accidentally cutting a client. "
        "Milady Procedure 5-3 says to stop the service immediately before putting on gloves, so the keyed "
        "sequence is unsafe to teach as written."
    ),
    "practice-comprehensive-072": (
        "The source asks about shaving within 48 hours before a pedicure. Milady advises clients not to shave "
        "or wax their legs within 24 hours before a pedicure, so the source's exact time window is not supported."
    ),
    "practice-comprehensive-115": (
        "Word key marks Sanitization as destroying ALL microbial life. "
        "Established fact: sterilization destroys all microbial life, including spores."
    ),
    "practice-nail-test-q004": (
        "The source keys primer as the substance that causes heat during acrylic application. Heat is produced by "
        "the exothermic polymerization reaction, not by primer, so the keyed answer is not safe to teach."
    ),
    "practice-nail-test-q007": (
        "The source recommends liquid disinfectant when a client is allergic to a hand-wash ingredient. "
        "Disinfectant is not a safe substitute for hand-washing product on skin."
    ),
    "practice-nail-test-q014": (
        "The source describes UV-light cabinet use as hospital-grade disinfection/sterilization. A UV storage "
        "cabinet does not replace required cleaning and EPA-registered disinfection."
    ),
    "practice-nail-test-q039": (
        "The stem asks how applying tips differs from acrylic gel, but the key 'UV light' does not form a complete "
        "or unambiguous comparison. The intended fact cannot be recovered reliably."
    ),
    "practice-nail-test-q046": (
        "The source answers a term question with the tautology 'a chemical reaction.' The textbook term for the "
        "reaction that joins monomers into polymers is polymerization."
    ),
    "practice-nail-test-q050": (
        "The key 'Incorrect usage' is too vague to identify or teach the cause of a client's heat complaint."
    ),
    "practice-nail-test-q061": (
        "The source says builder gel binds polymer and monomer. Builder gel is not the agent that combines liquid "
        "monomer and polymer powder; the premise is chemically unsound."
    ),
    "practice-nail-test-q068": (
        "The source assigns an unsupported exact figure of about 99 percent harmless bacteria. The textbook says "
        "most bacteria are nonpathogenic but does not support this percentage."
    ),
    "practice-nail-test-q088": (
        "The keyed term 'Ethyl acrylic' is not a recognized monomer name. The likely intended term is ethyl "
        "methacrylate, but the source wording is not reliable enough to silently correct."
    ),
    "practice-nail-test-q083": (
        "The keyed answer gives two different massage techniques ('Shiatsu or Effleurage'), so the item has no "
        "single defensible correct choice."
    ),
    "practice-nail-test-q115": (
        "Several massage techniques can be used on the hand; the generic stem does not uniquely identify tapotement."
    ),
    "practice-nail-test-q117": (
        "Two to three weeks is a common maintenance/fill interval, not a universal requirement to remove acrylic "
        "nails. The source wording would teach an incorrect rule."
    ),
    "practice-nail-test-q091": (
        "The source calls the patella the largest bone in the knee area. The patella is the largest sesamoid bone; "
        "the femur is the body's largest bone. The stem is too imprecise to ship with this key."
    ),
    "practice-nail-test-q124": (
        "The source says to remove artificial nails from a client with suspected mold or fungal disease. "
        "A nail technician should not diagnose or work on a suspected infection; the item needs a safety rewrite."
    ),
    "practice-nail-test-q129": (
        "The source keys Polymer for permanent visible skin damage. This is unsupported and conflicts with the "
        "textbook's skin-damage guidance; no reliable correction can be inferred from the prompt."
    ),
    "practice-nail-test-q140": (
        "The source keys nail bed as the part that protects against bacterial infection. The textbook assigns the "
        "seal/barrier role at the free edge to the hyponychium, so this key is not safe to teach."
    ),
    "practice-nail-test-q141": (
        "The source treats a UV cabinet as a sterilizer after hospital-level disinfection. UV cabinets are not a "
        "substitute for required cleaning and EPA-registered disinfection, so this wording is unsafe."
    ),
    "practice-nail-test-q150": (
        "The stem 'efforts to prevent growth' does not define immunity, the keyed answer. The intended concept "
        "cannot be recovered reliably from the source wording."
    ),
    "practice-nail-test-q160": (
        "The source calls the tacky surface left by an odorless monomer a 'curing layer.' The recognized concept is "
        "an inhibition/tacky layer; the keyed term is not reliable."
    ),
    "practice-nail-test-q175": (
        "Rinsing out dirty water alone does not disinfect a foot bath. Shipping this keyed answer would teach an "
        "unsafe infection-control procedure."
    ),
    "practice-nail-test-q060": (
        "The source says to press a metal cuticle tool on the nail bed. The textbook procedure uses gentle pressure "
        "on the moist nail plate and avoids injury to living tissue."
    ),
    "practice-nail-test-q044": (
        "The source keys nickel as a file-tip material, but the textbook describes carbide, diamond, ceramic, and "
        "abrasive bands for electric-file bits; nickel appears only as an implement plating."
    ),
    "practice-nail-test-q073": (
        "Several abrasives can shape an acrylic free edge; the generic stem does not make 'metal file' uniquely correct."
    ),
    "practice-nail-test-q077": (
        "'Protective gear' is too broad for a most-important safety question, and several specific protective "
        "measures could also be correct."
    ),
    "practice-nail-test-q080": (
        "'Strong massage on the surface of the arm' does not uniquely define deep-tissue massage and does not match "
        "the textbook's named basic massage movements."
    ),
    "practice-nail-test-q081": (
        "The source recommends slightly rounded toenail corners. General safety guidance is to trim toenails straight "
        "across to reduce ingrown-nail risk, so this wording should not ship as a rule."
    ),
    "practice-nail-test-q092": (
        "The source says a round natural nail requires an oval tip. Tip shape should fit the nail and desired result; "
        "the generic stem does not make oval uniquely correct."
    ),
    "practice-nail-test-q130": (
        "Effleurage is itself a gliding/stroking massage movement. The phrase 'combined with a gliding motion' does "
        "not uniquely define it."
    ),
    "practice-nail-test-q131": (
        "The answer describes a product bead, while the stem/distractor structure was extracted as a tool question. "
        "It needs question-specific visual/procedural authoring."
    ),
    "practice-nail-test-q133": (
        "'Using personal protective equipment' is too broad to be the unique answer to a most-important safety item."
    ),
    "practice-nail-test-q161": (
        "The textbook term is pathogenic organisms. The source key 'infectious organisms' is not the expected exam term."
    ),
    "practice-nail-test-q187": (
        "Course length is jurisdiction- and schedule-dependent; the source gives six months without identifying a "
        "program or licensing jurisdiction."
    ),
    "practice-nail-test-q200": (
        "The source calls carbide the 'sharpest material' for an electric file. Bit cutting action depends on design "
        "and grit; carbide, diamond, ceramic, and sanding bands are not ranked by one universal sharpness rule."
    ),
    "practice-nail-test-n026": (
        "The source keys onychoptosis for inflamed tissue surrounding the nail. The recognized term is paronychia; "
        "onychoptosis means shedding or falling off of the nail."
    ),
    "practice-nail-test-n015": (
        "The source calls the nail root the only true living part, but the matrix is the living growth tissue and "
        "other tissues in the nail unit are also living. The absolute wording is inaccurate."
    ),
    "practice-nail-test-n039": (
        "The stem defines nail walls but keys 'Body.' Nail walls are folds of skin overlapping the sides of the nail; "
        "the keyed answer does not complete the statement."
    ),
    "practice-nail-test-n031": (
        "The source teaches immersion in 70 percent ethyl alcohol for ten minutes as implement disinfection. This is "
        "outdated and not a safe general salon disinfection rule."
    ),
    "practice-nail-test-n033": (
        "The keyed all-of-the-above answer combines several muscles, while the generated alternatives name muscles "
        "that each control some hand movement. The stem is not exclusive."
    ),
    "practice-nail-test-n042": (
        "The stem asks which option is not a nail disease, but more than one listed condition can be classified as a "
        "disorder or skin condition rather than a nail disease."
    ),
    "practice-nail-test-n009": (
        "More than one synthetic gel-brush shape can blend and shape gel. The stem gives no service detail that makes "
        "a small flat brush uniquely correct."
    ),
    "practice-nail-test-n013": (
        "More than one noninfectious nail condition may receive a carefully adapted manicure. The stem does not make "
        "onychophagy the only safe answer."
    ),
}
KNOWN_QUARANTINE_AUTHORITY_REFS = {
    "practice-nail-test-n011": [{"source": "Milady Standard Foundations", "section": "Life Skills - Personality and Success", "printedPage": "3-15", "pdfPage": 498}],
    "practice-comprehensive-006": [{"source": "Milady Standard Foundations", "section": "Life Skills - Social Media", "printedPage": "10-17", "pdfPage": 505}],
    "practice-comprehensive-011": [{"source": "Milady Standard Foundations", "section": "Workplace Health - Fatigue and Hydration", "printedPage": "90-94", "pdfPage": 585}],
    "practice-comprehensive-034": [{"source": "Milady Standard Foundations", "section": "Career Planning - Income and Taxes", "printedPage": "230-260", "pdfPage": 725}],
    "practice-comprehensive-164": [{"source": "Milady Standard Foundations", "section": "Life Skills - Positive Attitude", "printedPage": "3-15", "pdfPage": 498}],
    "practice-comprehensive-172": [{"source": "Milady Standard Foundations", "section": "Career Planning - Job Opportunities", "printedPage": "219-230", "pdfPage": 715}],
    "practice-nail-test-q021": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Manicuring - Nail Shapes and Filing", "printedPage": "157-160", "pdfPage": 181}],
    "practice-nail-test-q023": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Manicuring - Files and Implements", "printedPage": "139-148", "pdfPage": 163}],
    "practice-nail-test-q025": [{"source": "Milady Standard Foundations", "section": "Infection Control - Cleaning and Disinfecting Implements", "printedPage": "138-140", "pdfPage": 633}],
    "practice-nail-test-q063": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Enhancement Structure - Stress Area", "printedPage": "262-263", "pdfPage": 286}],
    "practice-nail-test-q065": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Disorders - Split and Brittle Nails", "printedPage": "107", "pdfPage": 131}],
    "practice-nail-test-q096": [{"source": "Milady Standard Foundations", "section": "Electricity and Light Therapy - Light Therapy", "printedPage": "191-194", "pdfPage": 686}],
    "practice-nail-test-q119": [{"source": "Milady Standard Foundations", "section": "Infection Control - Hand and Nail Washing", "printedPage": "135", "pdfPage": 630}],
    "practice-nail-test-q120": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Manicuring - Nail Shapes and French Manicure", "printedPage": "157-160", "pdfPage": 181}],
    "practice-nail-test-q126": [{"source": "Milady Standard Foundations", "section": "Infection Control - Hand and Nail Washing", "printedPage": "135", "pdfPage": 630}],
    "practice-nail-test-q196": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Electric Filing - Safe Angles", "printedPage": "240-248", "pdfPage": 264}],
    "practice-nail-test-q202": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Post-Service Procedure", "printedPage": "172-181", "pdfPage": 196}],
    "practice-nail-test-n002": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Product Chemistry - Preparing for Adhesion", "printedPage": "119", "pdfPage": 143}],
    "practice-nail-test-n032": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Structure - Proximal Nail Fold and Matrix", "printedPage": "99-102", "pdfPage": 123}],
    "practice-nail-test-n040": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Structure - Matrix and Root Area", "printedPage": "99-102", "pdfPage": 123}],
    "practice-nail-test-n041": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Structure - Major Parts", "printedPage": "97-102", "pdfPage": 121}],
    "practice-comprehensive-152": [{"source": "Milady Standard Foundations", "section": "Electricity - Electrical Measurements", "printedPage": "184-191", "pdfPage": 679}],
    "practice-comprehensive-153": [{"source": "Milady Standard Foundations", "section": "Electricity - Watts", "printedPage": "184-191", "pdfPage": 679}],
    "practice-nail-test-q052": [{"source": "Milady Standard Foundations", "section": "Infection Control - Sodium Hypochlorite", "printedPage": "119-123", "pdfPage": 614}],
    "practice-nail-test-q125": [{"source": "Milady Standard Foundations", "section": "Infection Control - Pathogenic and Nonpathogenic Bacteria", "printedPage": "103-106", "pdfPage": 598}],
    "practice-nail-test-n018": [{"source": "Milady Standard Foundations", "section": "Infection Control - Local and Systemic Infections", "printedPage": "106-109", "pdfPage": 601}],
    "practice-nail-test-n020": [{"source": "Milady Standard Foundations", "section": "Infection Control - Quaternary Ammonium Compounds", "printedPage": "120-123", "pdfPage": 615}],
    "practice-nail-test-n021": [{"source": "Milady Standard Foundations", "section": "Infection Control - Disinfecting Implements", "printedPage": "138-140", "pdfPage": 633}],
    "practice-nail-test-n023": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Structure - Nail Folds and Surrounding Skin", "printedPage": "99-102", "pdfPage": 123}],
    "practice-nail-test-n027": [{"source": "Milady Standard Foundations", "section": "Infection Control - Procedure 5-3: Client Injury", "printedPage": "141-143", "pdfPage": 636}],
    "practice-theory-update-023": [{"source": "Milady Standard Foundations", "section": "Infection Control - Cleaning and Disinfecting Implements", "printedPage": "138-140", "pdfPage": 633}],
    "practice-comprehensive-123": [{"source": "Milady Standard Foundations", "section": "Infection Control - Parasites", "printedPage": "108-109", "pdfPage": 603}],
    "practice-nail-test-q024": [{"source": "Milady Standard Foundations", "section": "General Anatomy - Digestive System and Liver", "printedPage": "42-47", "pdfPage": 66}],
    "practice-nail-test-q144": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Manicuring - Massage Movements", "printedPage": "162", "pdfPage": 186}],
    "practice-comprehensive-175": [{"source": "Milady Standard Foundations", "section": "General Anatomy - Body Systems", "printedPage": "18-57", "pdfPage": 42}],
    "practice-comprehensive-075": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Electric Filing - Speed Controls", "printedPage": "230-240", "pdfPage": 254}],
    "practice-nail-test-q027": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Product Chemistry - Product Allergies", "printedPage": "117-120", "pdfPage": 141}],
    "practice-nail-test-q029": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "UV and LED Gels - Proper Curing", "printedPage": "370-376", "pdfPage": 394}],
    "practice-nail-test-q038": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "UV and LED Gels - Proper Curing", "printedPage": "370-376", "pdfPage": 394}],
    "practice-nail-test-q051": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Enhancement Structure - Stress Area", "printedPage": "262-263", "pdfPage": 286}],
    "practice-nail-test-q056": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "UV and LED Gels - Product Types", "printedPage": "370-376", "pdfPage": 394}],
    "practice-nail-test-q059": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Tips - Application and Contact Area", "printedPage": "252-260", "pdfPage": 276}],
    "practice-nail-test-q090": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Monomer Liquid and Polymer Powder - Mix Ratio", "printedPage": "324-330", "pdfPage": 348}],
    "practice-nail-test-q093": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Tips - Application and Stop Point", "printedPage": "252-260", "pdfPage": 276}],
    "practice-nail-test-q099": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "UV and LED Gels - Removal", "printedPage": "378-382", "pdfPage": 402}],
    "practice-nail-test-q104": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Manicuring - Nail Shapes", "printedPage": "158-159", "pdfPage": 182}],
    "practice-nail-test-q113": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "UV and LED Gels - Proper Curing", "printedPage": "370-376", "pdfPage": 394}],
    "practice-nail-test-q127": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Electric Filing - Safe Technique", "printedPage": "240-248", "pdfPage": 264}],
    "practice-nail-test-q128": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "UV and LED Gels - Light Curing", "printedPage": "370-376", "pdfPage": 394}],
    "practice-nail-test-q142": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Product Chemistry - Product Allergies", "printedPage": "117-120", "pdfPage": 141}],
    "practice-nail-test-q152": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Tips - Application on Bitten Nails", "printedPage": "252-260", "pdfPage": 276}],
    "practice-nail-test-q154": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "UV and LED Gels - Product Types", "printedPage": "370-376", "pdfPage": 394}],
    "practice-nail-test-q155": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "UV and LED Gels - Building Gels", "printedPage": "370-379", "pdfPage": 394}],
    "practice-nail-test-q165": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Tips - Full-Coverage Tips and Removal", "printedPage": "252-267", "pdfPage": 276}],
    "practice-nail-test-q197": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Tips - Adhesive Application and Fit", "printedPage": "252-260", "pdfPage": 276}],
    "practice-nail-test-q203": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Product Chemistry - Methyl Methacrylate Monomer", "printedPage": "124-125", "pdfPage": 148}],
    "practice-nail-test-q204": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Tips - Application and Contact Area", "printedPage": "252-260", "pdfPage": 276}],
    "practice-nail-test-n003": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Product Chemistry - Nail Coatings", "printedPage": "125-126", "pdfPage": 149}],
    "practice-nail-test-q009": [{"source": "Milady Standard Foundations", "section": "Chemistry and Chemical Safety - Chemical Safety", "printedPage": "170-176", "pdfPage": 665}],
    "practice-nail-test-q012": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "UV and LED Gels - Removal", "printedPage": "374-382", "pdfPage": 398}],
    "practice-nail-test-q058": [{"source": "Milady Standard Foundations", "section": "Chemistry and Chemical Safety - Disposal", "printedPage": "173", "pdfPage": 668}],
    "practice-nail-test-q070": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Product Chemistry - Vapors, Dusts, and Fumes", "printedPage": "126-130", "pdfPage": 150}],
    "practice-nail-test-q121": [{"source": "Milady Standard Foundations", "section": "Infection Control - Disinfectants and Antiseptics", "printedPage": "118-126", "pdfPage": 613}],
    "practice-nail-test-q143": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Product Chemistry - Primers", "printedPage": "117-118", "pdfPage": 141}],
    "practice-nail-test-q171": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Product Chemistry - Primers", "printedPage": "117-118", "pdfPage": 141}],
    "practice-nail-test-q189": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Product Chemistry - Catalysts", "printedPage": "123", "pdfPage": 147}],
    "practice-comprehensive-140": [{"source": "Milady Standard Foundations", "section": "Chemistry and Chemical Safety - Elements", "printedPage": "154-155", "pdfPage": 649}],
    "practice-comprehensive-143": [{"source": "Milady Standard Foundations", "section": "Chemistry and Chemical Safety - Molecules and Chemical Changes", "printedPage": "156-157", "pdfPage": 651}],
    "practice-nail-test-q006": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Gel Services - Post-Service Procedure", "printedPage": "374-382", "pdfPage": 398}],
    "practice-nail-test-q037": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Pedicuring - Pre-Service Procedure", "printedPage": "208-213", "pdfPage": 232}],
    "practice-nail-test-q043": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Manicuring - Nail Coatings", "printedPage": "149-153", "pdfPage": 173}],
    "practice-nail-test-q122": [{"source": "Milady Standard Foundations", "section": "Infection Control - Open Wounds and Exposure Incidents", "printedPage": "126-143", "pdfPage": 621}],
    "practice-nail-test-n028": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Manicuring - Metal Pusher Use", "printedPage": "165-167", "pdfPage": 189}],
    "practice-nail-test-n036": [{"source": "Milady Standard Nail Technology 8th Edition", "section": "Nail Structure - Cuticle", "printedPage": "101-102", "pdfPage": 125}],
    "practice-comprehensive-050": [
        {
            "source": "Milady Standard Nail Technology 8th Edition",
            "section": "Skin Disorders - Dermatitis and Eczema",
            "printedPage": "82-89",
            "pdfPage": 106,
        }
    ],
    "practice-comprehensive-051": [
        {
            "source": "Milady Standard Nail Technology 8th Edition",
            "section": "Skin Disorders - Product Allergies and Sensitization",
            "printedPage": "82-84",
            "pdfPage": 106,
        }
    ],
    "practice-comprehensive-186": [
        {
            "source": "Milady Standard Nail Technology 8th Edition",
            "section": "Skin Structure - Characteristics of Healthy Skin",
            "printedPage": "80-81",
            "pdfPage": 104,
        }
    ],
    "practice-nail-test-q049": [
        {
            "source": "Milady Standard Nail Technology 8th Edition",
            "section": "Nail Disorders - Onychauxis",
            "printedPage": "105-107",
            "pdfPage": 129,
        }
    ],
    "practice-nail-test-n004": [
        {
            "source": "Milady Standard Nail Technology 8th Edition",
            "section": "Nail Diseases - Onychia and Paronychia",
            "printedPage": "109",
            "pdfPage": 133,
        }
    ],
    "practice-nail-test-n058": [
        {
            "source": "Milady Standard Nail Technology 8th Edition",
            "section": "Nail Structure - Nail Plate, Nail Bed, and Free Edge",
            "printedPage": "99-100",
            "pdfPage": 123,
        }
    ],
    "practice-theory-update-024": [
        {
            "source": "Milady Standard Foundations",
            "section": "Infection Control - Procedure 5-3: Handling an Exposure Incident: Client Injury",
            "printedPage": "141-143",
            "pdfPage": 636,
        }
    ],
    "practice-comprehensive-072": [
        {
            "source": "Milady Standard Foundations",
            "section": "Infection Control - Mycobacterium",
            "printedPage": "108",
            "pdfPage": 603,
        }
    ],
}

# The extracted source answer is immutable. Stems and teaching copy may clarify
# wording, but the keyed choice must remain byte-for-byte equal to answerEn.
ANSWER_OVERRIDES: dict[str, str] = {}

# Correct obvious source typos only in learner-facing choice text. `sourceEn`
# remains attached to the choice so transcription verification still compares
# the exact Word text and the correction stays auditable.
SOURCE_CHOICE_DISPLAY_OVERRIDES = {
    "practice-comprehensive-117": {
        "b": {
            "en": "They are less specific than laws.",
            "zh": "规章不如法律具体。",
            "reason": "The source says 'pacific'; the contrast with 'more specific' makes 'specific' the clear intended word.",
        },
    },
}

QUESTION_OVERRIDES = {
    "practice-nail-test-q001": {
        "questionEn": "At what angle should an electric file be held to cut or shorten acrylic?",
        "questionZh": "用电动磨甲机切割或缩短丙烯酸甲时，应保持什么角度？",
    },
    "practice-nail-test-q003": {
        "questionEn": "At what angle should an electric file be held to file and shape acrylic?",
        "questionZh": "用电动磨甲机打磨和修整丙烯酸甲时，应保持什么角度？",
    },
    "practice-nail-test-q005": {
        "questionEn": "At what angle should an electric file be held to shorten an enhancement?",
        "questionZh": "用电动磨甲机缩短美甲增强层时，应保持什么角度？",
    },
    "practice-nail-test-q008": {
        "questionEn": "Which nail enhancement covers the whole nail plate and can help protect bitten nails?",
        "questionZh": "哪种美甲增强方式可覆盖整个甲板，并帮助保护被咬过的指甲？",
    },
    "practice-nail-test-q009": {
        "questionEn": "How should salon workers reduce the risk of contaminating food with salon chemicals?",
        "questionZh": "沙龙工作人员应如何降低食品被沙龙化学品污染的风险？",
    },
    "practice-nail-test-q024": {
        "questionEn": "Which organ discharges waste containing bile?",
        "questionZh": "哪个器官排出含有胆汁的废物？",
    },
    "practice-nail-test-q025": {
        "questionEn": "Before nail tools are used on another client, what must happen?",
        "questionZh": "美甲工具用于下一位顾客之前，必须做什么？",
    },
    "practice-nail-test-q041": {
        "questionEn": "Which muscle moves the fingers away from one another?",
        "questionZh": "哪块肌肉使手指彼此分开？",
    },
    "practice-nail-test-q053": {
        "questionEn": "Which organ eliminates waste through perspiration?",
        "questionZh": "哪个器官通过汗液排出废物？",
    },
    "practice-nail-test-q055": {
        "questionEn": "Which tissue lies beneath the nail's free edge?",
        "questionZh": "哪种组织位于指甲游离缘下方？",
    },
    "practice-nail-test-q057": {
        "questionEn": "Which tool is used to trim loose, dead cuticle tissue?",
        "questionZh": "哪种工具用于修剪松散的死甲小皮组织？",
    },
    "practice-nail-test-q074": {
        "questionEn": "Which follow-up action supports the client's future nail care after a service?",
        "questionZh": "服务结束后，哪项后续行动有助于顾客继续护理指甲？",
    },
    "practice-nail-test-q106": {
        "questionEn": "Which document provides a product's safety and handling instructions?",
        "questionZh": "哪份文件提供产品的安全与操作说明？",
    },
    "practice-nail-test-q098": {
        "questionEn": "Which growth tissue lies beneath the nail root?",
        "questionZh": "哪种生长组织位于甲根下方？",
    },
    "practice-nail-test-q102": {
        "questionEn": "Which infection-control practice helps prevent the spread of disease?",
        "questionZh": "哪种感染控制措施有助于防止疾病传播？",
    },
    "practice-nail-test-q110": {
        "questionEn": "Which forearm bone is on the little-finger side?",
        "questionZh": "前臂中位于小指一侧的是哪块骨？",
    },
    "practice-nail-test-q086": {
        "questionEn": "What general name is given to the small nerves that extend into the fingers?",
        "questionZh": "延伸到手指中的小神经通常称为什么？",
    },
    "practice-nail-test-q118": {
        "questionEn": "Which forearm muscle straightens the fingers?",
        "questionZh": "前臂中哪块肌肉使手指伸直？",
    },
    "practice-nail-test-q138": {
        "questionEn": "Which U.S. agency requires employers to maintain Safety Data Sheets for hazardous products?",
        "questionZh": "美国哪个机构要求雇主为危险产品保存安全数据表（SDS）？",
    },
    "practice-nail-test-q145": {
        "questionEn": "Which massage movement uses rapid tapping?",
        "questionZh": "哪种按摩动作使用快速叩击？",
    },
    "practice-nail-test-q149": {
        "questionEn": "Which substances made naturally by the body help moisturize the skin?",
        "questionZh": "身体自然产生的哪些物质有助于滋润皮肤？",
    },
    "practice-nail-test-q151": {
        "questionEn": "How should a disinfectant be mixed and used?",
        "questionZh": "消毒剂应如何配制和使用？",
    },
    "practice-nail-test-q157": {
        "questionEn": "Which liquid is mixed with polymer powder to create an acrylic enhancement product?",
        "questionZh": "哪种液体与聚合物粉混合后可制成丙烯酸美甲产品？",
    },
    "practice-nail-test-q164": {
        "questionEn": "What should a technician wear to reduce breathing acrylic dust during electric filing?",
        "questionZh": "电动打磨丙烯酸甲时，技师应佩戴什么来减少吸入粉尘？",
    },
    "practice-nail-test-q170": {
        "questionEn": "Which major skin layer contains the outer layer of dead cells?",
        "questionZh": "哪个主要皮肤层包含最外层的死细胞？",
    },
    "practice-nail-test-q201": {
        "questionEn": "Before using an electric file on a callus, what condition must the skin be in?",
        "questionZh": "用电动磨甲机处理胼胝前，皮肤必须处于什么状态？",
    },
    "practice-nail-test-q203": {
        "questionEn": "Which U.S. agency prohibits methyl methacrylate (MMA) in nail products?",
        "questionZh": "美国哪个机构禁止在美甲产品中使用甲基丙烯酸甲酯（MMA）？",
    },
    "practice-nail-test-n041": {
        "questionEn": "Which structure is not one of the three main parts of the natural nail?",
        "questionZh": "哪一结构不属于天然指甲的三个主要部分？",
    },
    "practice-nail-test-n004": {
        "questionEn": "Which nail disease involves inflammation of the matrix and may include pus, redness, and swelling?",
        "questionZh": "哪种指甲疾病涉及甲母质发炎，并可能出现脓液、发红和肿胀？",
    },
    "practice-nail-test-n006": {
        "questionEn": "For at least how long should hands be scrubbed and lathered with liquid soap?",
        "questionZh": "用洗手液搓洗双手并起泡至少应持续多长时间？",
    },
    "practice-nail-test-n017": {
        "questionEn": "A boil is an example of which type of infection?",
        "questionZh": "疖肿属于哪种类型的感染？",
    },
    "practice-nail-test-n018": {
        "questionEn": "Which is an example of a general infection?",
        "questionZh": "哪一项属于全身性感染的例子？",
    },
    "practice-nail-test-n019": {
        "questionEn": "Which types of bacteria are destroyed during sterilization?",
        "questionZh": "灭菌过程中会杀死哪些类型的细菌？",
    },
    "practice-nail-test-n028": {
        "questionEn": "How should a metal cuticle pusher be used?",
        "questionZh": "应如何使用金属甲小皮推？",
    },
    "practice-nail-test-n038": {
        "questionEn": "Which muscle group brings the fingers together?",
        "questionZh": "哪组肌肉使手指并拢？",
    },
    "practice-nail-test-n040": {
        "questionEn": "Where is the nail root lodged within the nail mantle?",
        "questionZh": "甲根位于甲沟内的什么位置？",
    },
    "practice-nail-test-n049": {
        "questionEn": "What does onychauxis mean?",
        "questionZh": "onychauxis（甲肥厚）是什么意思？",
    },
    "practice-nail-test-n053": {
        "questionEn": "How does leukonychia usually appear?",
        "questionZh": "白甲病（leukonychia）通常表现为何种外观？",
    },
    "practice-nail-test-n059": {
        "questionEn": "Which is the outermost of the three major skin layers?",
        "questionZh": "三大主要皮肤层中，最外层是哪一层？",
    },
}

DISTRACTOR_OVERRIDES = {
    "practice-nail-test-q008": ["Gel overlay", "Silk wrap", "Sculptured acrylic overlay"],
    "practice-nail-test-q009": [
        "Eat only after covering the work table",
        "Keep food beside closed product containers",
        "Wash hands, then eat at the work desk",
    ],
    "practice-nail-test-q106": ["Client intake form", "Service record", "Appointment book"],
    "practice-nail-test-q025": ["They must be sharpened", "They must be placed in clean storage", "They must be returned to the workstation"],
    "practice-nail-test-q151": [
        "Use the same dilution for every product",
        "Mix it stronger for faster results",
        "Estimate the dilution by color",
    ],
    "practice-nail-test-q187": ["3 months", "9 months", "12 months"],
    "practice-nail-test-q044": ["Carbide", "Diamond", "Ceramic"],
    "practice-nail-test-q200": ["Diamond", "Ceramic", "Sanding band"],
    "practice-nail-test-n009": ["Oval gel brush", "Round acrylic brush", "Detail liner brush"],
    "practice-nail-test-n017": ["A general infection", "An allergic reaction", "A nonpathogenic condition"],
    "practice-nail-test-n018": ["Localized boil", "Hangnail", "Bruised nail"],
    "practice-nail-test-n019": ["Only harmful bacteria", "Only beneficial bacteria", "Only fungi and viruses"],
    "practice-nail-test-n028": ["At a steep angle with firm pressure", "On dry tissue with a sawing motion", "Under the free edge with the point"],
    "practice-nail-test-n037": ["1/32 inch", "1/8 inch", "1/4 inch"],
    "practice-nail-test-n040": ["At the free edge", "Along the sidewall", "Under the nail tip"],
    "practice-nail-test-n041": ["Nail root", "Nail body", "Free edge"],
    "practice-nail-test-n049": ["Thinning of the nail plate", "Separation from the nail bed", "White spots in the nail plate"],
    "practice-nail-test-n053": ["Deep horizontal ridges", "A dark lengthwise streak", "Separation from the nail bed"],
    "practice-nail-test-n059": ["Dermis", "Subcutaneous tissue", "Muscle tissue"],
    "practice-nail-test-q033": ["With cilia", "By forming spores", "By cell division"],
    "practice-nail-test-q039": ["By air drying", "With LED light only", "Without any curing light"],
    "practice-nail-test-q068": ["around 25% of bacteria are harmless", "around 50% of bacteria are harmless", "around 75% of bacteria are harmless"],
    "practice-nail-test-q088": ["Methyl methacrylate", "Odorless monomer liquid", "Methacrylic Acid"],
    "practice-nail-test-q121": ["Disinfectants only", "Antiseptics only", "Cleaning agents for all surfaces"],
    "practice-nail-test-q134": [
        "Wipe the nails again with alcohol",
        "Apply nail primer over the finished gel",
        "Soak the finished gel in acetone",
    ],
    "practice-nail-test-n005": ["Viscosity", "Solubility", "Evaporation rate"],
    "practice-nail-test-n029": ["Bactericide only", "Virucide only", "Fungicide only"],
    "practice-nail-test-n035": ["front to back of the nail", "side to side across the nail", "in small circles on the nail"],
    "practice-nail-test-n046": ["Monomers", "Oligomers", "Catalysts"],
    "practice-nail-test-q004": ["Monomer", "Polymer", "Oligomer"],
    "practice-nail-test-q016": ["Employee schedules", "Client color preferences", "Service prices"],
    "practice-nail-test-q026": ["Wipe only the used area with a dry towel", "Leave the table for the next service", "Cover the table without cleaning it"],
    "practice-nail-test-q034": ["Ethyl methacrylate", "Odorless monomer liquid", "Methacrylic Acid"],
    "practice-nail-test-q036": ["One confined to a small area", "One caused by an allergy", "One caused by nonpathogenic organisms"],
    "practice-nail-test-q040": ["A contagious disease", "A fungal infection", "An allergic reaction"],
    "practice-nail-test-q042": ["Reuse them for the next client", "Rinse and return them immediately", "Leave them on the workstation"],
    "practice-nail-test-q046": ["A physical change", "Evaporation", "Condensation"],
    "practice-nail-test-q052": ["Hydrogen peroxide", "Acetone", "Isopropyl alcohol"],
    "practice-nail-test-q060": ["At a steep angle with firm pressure", "On dry tissue with a sawing motion", "Under the free edge with the point"],
    "practice-nail-test-q061": ["UV gel", "Gel polish", "Oligomer"],
    "practice-nail-test-q064": ["Hydrogen peroxide", "Acetone", "Isopropyl alcohol"],
    "practice-nail-test-q065": ["Nail adhesive", "Primer", "Nail polish remover"],
    "practice-nail-test-q070": ["Dust", "Mist", "Smoke"],
    "practice-nail-test-q073": ["Abrasive board", "Carbide bit", "Chamois buffer"],
    "practice-nail-test-q077": ["Work with bare hands", "Eat at the work desk", "Work without ventilation"],
    "practice-nail-test-q082": ["Sanitation knowledge", "Customer-service skills", "Technical nail skills"],
    "practice-nail-test-q096": ["Heat therapy", "Massage therapy", "Water therapy"],
    "practice-nail-test-q100": ["A gas", "A liquid", "Plasma"],
    "practice-nail-test-q107": ["When it is outdated and locked away", "When only the manufacturer can access it", "When it is replaced by a product label"],
    "practice-nail-test-q112": ["While the nails are wet", "Immediately after soaking", "After applying cuticle oil"],
    "practice-nail-test-q123": ["Rebalance", "Repair", "Overlay"],
    "practice-nail-test-q129": ["Monomer", "Primer", "Acetone"],
    "practice-nail-test-q131": ["A thin string of product", "A dry patch of powder", "A flat film of liquid"],
    "practice-nail-test-q133": ["Work without a dust mask", "Hold the client's hand too tightly", "Use the file at maximum speed"],
    "practice-nail-test-q136": ["Cuticle oil", "Nail polish remover", "Acetone"],
    "practice-nail-test-q141": ["Tools rinsed with water only", "Tools wiped with a dry towel", "Single-use porous tools"],
    "practice-nail-test-q143": ["Non-acid primer", "Nail dehydrator", "Nail adhesive"],
    "practice-nail-test-q156": ["Primer", "Monomer", "Acetone"],
    "practice-nail-test-q160": ["An inhibition layer", "A dispersion layer", "An uncured layer"],
    "practice-nail-test-q161": ["Pathogenic organisms", "Nonpathogenic organisms", "Saprophytes"],
    "practice-nail-test-q165": ["Sculptured nails", "Nail wraps", "Acrylic overlays"],
    "practice-nail-test-q166": ["Anatomy", "Physiology", "Cytology"],
    "practice-nail-test-q168": ["Plasticizer", "Solvent", "Color pigment"],
    "practice-nail-test-q169": ["Monomer", "Polymer", "Catalyst"],
    "practice-nail-test-q171": ["Cyanoacrylate", "Nitrocellulose", "Oligomer"],
    "practice-nail-test-q173": ["Methacrylic Acid", "Nitrocellulose", "Oligomer"],
    "practice-nail-test-q177": ["A fungal infection", "An allergic reaction", "A pigment change"],
    "practice-nail-test-q178": ["A solute", "A suspension", "An emulsion"],
    "practice-nail-test-q179": ["Product curing", "Tool disinfection", "Polish removal"],
    "practice-nail-test-q183": ["From the client", "From an appointment book", "From a salon advertisement"],
    "practice-nail-test-q184": ["At the technician's home", "In a locked off-site archive", "In the client's file"],
    "practice-nail-test-q189": ["An inhibitor", "A solvent", "A monomer"],
    "practice-nail-test-q190": ["Catalyst", "Solute", "Suspension"],
    "practice-nail-test-q192": ["Color", "Drying time", "Odor"],
    "practice-nail-test-q193": ["File the skin", "Soak without exfoliating", "Apply polish remover"],
    "practice-nail-test-n008": ["Frequent chemical exposure", "Skipping meals", "Poor hygiene"],
    "practice-nail-test-n010": ["1/20 inch per month", "1/5 inch per month", "1/2 inch per month"],
    "practice-nail-test-n011": ["A negative attitude", "Unreliable attendance", "Poor hygiene"],
    "practice-nail-test-n012": ["Disinfection", "Sterilization", "Clean storage"],
    "practice-nail-test-n014": ["Protect", "Secrete", "Digest"],
    "practice-nail-test-n016": ["Spherical shaped", "Spiral shaped", "Comma shaped"],
    "practice-nail-test-n020": ["Dry sanitizer", "Autoclave", "UV cabinet"],
    "practice-nail-test-n025": ["Pathogenic bacteria", "Cocci", "Bacilli"],
    "practice-nail-test-n036": ["Eponychium", "Hyponychium", "Perionychium"],
    "practice-nail-test-n047": ["Pathogenic bacteria", "Cocci", "Bacilli"],
    "practice-nail-test-n048": ["Hinge joints", "Pivot joints", "Ball-and-socket joints"],
    "practice-nail-test-n050": ["Client polish preferences", "Appointment history", "Service prices"],
    "practice-nail-test-n054": ["Base coat", "Primer", "Adhesive"],
    "practice-nail-test-n057": ["Cuticle oil", "Top coat", "Nail adhesive"],
    "practice-nail-test-n060": ["Polymer", "Oligomer", "Resin"],
    "practice-nail-test-q049": ["Onycholysis", "Onychophagy", "Leukonychia"],
    "practice-nail-test-n013": ["Onychia", "Onycholysis", "Onychauxis"],
}

# Use only when the meaning of a specific letter matters for an already
# reviewed card. The remaining letter is reserved for the correct answer.
POSITIONED_DISTRACTOR_OVERRIDES = {
    "practice-nail-test-q002": {
        "a": "Effleurage",
        "c": "Petrissage",
        "d": "Vibration",
    },
    "practice-nail-test-q008": {
        "a": "A small silk patch on one crack",
        "b": "A partial-well nail tip",
        "d": "A nail art decal",
    },
    "practice-nail-test-q010": {
        "a": "To remove an acrylic enhancement",
        "b": "To harden cured gel",
        "d": "To disinfect metal tools",
    },
    "practice-nail-test-q022": {
        "a": "Wear gloves instead of washing",
        "b": "Rinse the hands with water only",
        "d": "Use surface disinfectant on the skin",
    },
    "practice-nail-test-q045": {
        "a": "Leave the used towels for later",
        "c": "Clean only the visible debris",
        "d": "Keep the same towels for the next client",
    },
    "practice-nail-test-q062": {
        "a": "Regular nail polish",
        "b": "Acrylic powder",
        "d": "Nail adhesive",
    },
    "practice-nail-test-q066": {
        "a": "They prevent every future break",
        "c": "They make the natural nail grow faster",
        "d": "They prevent all product lifting",
    },
    "practice-nail-test-q067": {
        "b": "Pry the enhancement off with a metal tool",
        "c": "Scrape the product off the natural nail",
        "d": "Pull off the softened product by force",
    },
    "practice-nail-test-q071": {
        "a": "Continue working while the cut is bleeding",
        "c": "Cover the cut and continue immediately",
        "d": "Ignore the cut if it looks small",
    },
    "practice-nail-test-q072": {
        "a": "Acetone polish remover",
        "b": "Nail adhesive",
        "c": "Acrylic primer",
    },
    "practice-nail-test-q074": {
        "a": "Leave the used implements on the table",
        "b": "Discard the client service record",
        "d": "Skip cleaning the work area",
    },
    "practice-nail-test-q075": {
        "a": "Median nerve",
        "b": "Radial nerve",
        "d": "Sciatic nerve",
    },
    "practice-nail-test-q076": {
        "a": "Petrissage",
        "c": "Tapotement",
        "d": "Vibration",
    },
    "practice-nail-test-q078": {
        "a": "Regular nail polish",
        "b": "A soak-off base coat",
        "d": "Cuticle oil",
    },
    "practice-nail-test-q079": {
        "b": "Continue filing the broken nail",
        "c": "Apply adhesive over the red area",
        "d": "Force the broken enhancement off",
    },
    "practice-nail-test-q086": {
        "b": "Plantar nerve",
        "c": "Sciatic nerve",
        "d": "Sural nerve",
    },
    "practice-nail-test-q087": {
        "a": "After the product has been applied",
        "b": "Only after an allergic reaction starts",
        "d": "At the end of the service",
    },
    "practice-nail-test-q094": {
        "a": "The technician's bare fingers",
        "b": "A spatula already used on another client",
        "d": "A cotton swab already used on another client",
    },
    "practice-nail-test-q095": {
        "b": "A chemical reaction",
        "c": "A biological infection",
        "d": "A sterilization process",
    },
    "practice-nail-test-q097": {
        "a": "The product was kept away from the skin",
        "b": "The correct powder-to-liquid ratio was used",
        "c": "The nail was prepared clean and dry",
    },
    "practice-nail-test-q101": {
        "a": "Inhalation",
        "b": "Ingestion",
        "d": "Injection",
    },
    "practice-nail-test-q103": {
        "a": "Use a coarse file with firm pressure",
        "b": "Buff the thin nail aggressively",
        "c": "Press a metal pusher onto the nail",
    },
    "practice-nail-test-q123": {
        "a": "Tip application",
        "b": "Polish change",
        "d": "Nail art service",
    },
    "practice-nail-test-q132": {
        "b": "Cuticle oil",
        "c": "Nail adhesive",
        "d": "Monomer liquid",
    },
    "practice-nail-test-q134": {
        "a": "Apply nail primer over the finished gel",
        "c": "Wipe the nails again with alcohol",
        "d": "Soak the finished gel in acetone",
    },
    "practice-nail-test-q135": {
        "a": "Return the tools without cleaning them",
        "b": "Rinse the tools with water only",
        "c": "Store used tools with clean tools",
    },
    "practice-nail-test-q136": {
        "b": "Cuticle oil",
        "c": "Nail adhesive",
        "d": "Acrylic primer",
    },
    "practice-nail-test-q137": {
        "a": "The wrist",
        "b": "The palm",
        "c": "The forearm",
    },
    "practice-nail-test-q139": {
        "a": "To cure a fungal infection",
        "c": "To harden the calluses",
        "d": "To disinfect metal tools",
    },
    "practice-nail-test-q145": {
        "b": "Effleurage",
        "c": "Petrissage",
        "d": "Vibration",
    },
    "practice-nail-test-q148": {
        "a": "Effleurage",
        "b": "Tapotement",
        "d": "Vibration",
    },
    "practice-nail-test-q149": {
        "a": "Saliva and tears",
        "c": "Keratin and melanin",
        "d": "Blood and lymph",
    },
    "practice-nail-test-q157": {
        "a": "Acetone",
        "b": "Nail adhesive",
        "d": "Cuticle oil",
    },
    "practice-nail-test-q158": {
        "a": "Pry off the remaining product",
        "c": "Scrape the nail with a metal implement",
        "d": "Pull off the softened product",
    },
    "practice-nail-test-q162": {
        "a": "To prevent fungal infections",
        "b": "To remove cured gel polish",
        "c": "To make UV gel cure faster",
    },
    "practice-nail-test-q163": {
        "a": "Once at the end of the day",
        "b": "Once each week",
        "c": "Only when they look dirty",
    },
    "practice-nail-test-q164": {
        "a": "Wear regular eyeglasses only",
        "b": "Wear a face shield without a dust mask",
        "c": "Wear gloves without face protection",
    },
    "practice-nail-test-q167": {
        "b": "Use a coarse file on the ridges",
        "c": "Soak the nails in acetone",
        "d": "Skip all moisturizing products",
    },
    "practice-nail-test-q168": {
        "a": "Cyanoacrylate",
        "b": "Oligomer",
        "d": "Monomer",
    },
    "practice-nail-test-q172": {
        "a": "An acrylic powder enhancement",
        "b": "A full-cover nail tip",
        "d": "A silk wrap",
    },
    "practice-nail-test-q174": {
        "a": "In a deep curve",
        "b": "With a pointed center",
        "d": "Down into both corners",
    },
    "practice-nail-test-q176": {
        "b": "Leave oil on the nail plate",
        "c": "Begin while the nail is still damp",
        "d": "Skip removing dust from the nail",
    },
    "practice-nail-test-q181": {
        "a": "In a deep rounded curve",
        "b": "Into a V shape",
        "d": "With the sides shorter than the center",
    },
    "practice-nail-test-q182": {
        "a": "In a deep rounded arc",
        "b": "Deep into the side corners",
        "d": "Back and forth across the skin",
    },
    "practice-nail-test-q188": {
        "b": "Effleurage",
        "c": "Petrissage",
        "d": "Vibration",
    },
    "practice-nail-test-q195": {
        "a": "To disinfect the foot basin",
        "c": "To treat a fungal infection",
        "d": "To harden the calluses",
    },
    "practice-nail-test-q198": {
        "b": "File down the swollen area",
        "c": "Apply adhesive over the broken area",
        "d": "Cover the nail with acrylic product",
    },
    "practice-nail-test-q201": {
        "a": "Coated with cuticle oil",
        "c": "Freshly soaked in water",
        "d": "Covered with moisturizing lotion",
    },
    "practice-nail-test-n001": {
        "a": "Acetone polish remover",
        "c": "Nail dehydrator",
        "d": "Monomer liquid",
    },
    "practice-nail-test-n007": {
        "a": "A fungal nail infection",
        "b": "An ingrown nail",
        "c": "Nail plate separation",
    },
    "practice-nail-test-n022": {
        "b": "Cuticle oil",
        "c": "Regular nail polish",
        "d": "Nail adhesive",
    },
    "practice-nail-test-n025": {
        "a": "Pathogenic bacteria",
        "b": "Viruses",
        "d": "Parasites",
    },
    "practice-nail-test-n038": {
        "a": "Flexors",
        "b": "Extensors",
        "c": "Abductors",
    },
    "practice-nail-test-n047": {
        "a": "Pathogenic bacteria",
        "c": "Viruses",
        "d": "Parasites",
    },
    "practice-nail-test-n054": {
        "a": "Cuticle oil",
        "b": "Monomer liquid",
        "c": "Nail adhesive",
    },
    "practice-nail-test-n057": {
        "a": "Cuticle remover",
        "c": "Nail adhesive",
        "d": "Acrylic primer",
    },
}

# Fine-grained pools for source items that were originally open-ended. Pool
# members share the kind of response the stem requests, so their source answers
# become credible distractors for one another without altering any source key.
CURATED_DISTRACTOR_GROUPS = {
    "gel-procedure": {
        "practice-nail-test-q006", "practice-nail-test-q012", "practice-nail-test-q038",
        "practice-nail-test-q089", "practice-nail-test-q099", "practice-nail-test-q105",
        "practice-nail-test-q134", "practice-nail-test-q199",
    },
    "infection-control-action": {
        "practice-nail-test-q022", "practice-nail-test-q026", "practice-nail-test-q037",
        "practice-nail-test-q042", "practice-nail-test-q045", "practice-nail-test-q058",
        "practice-nail-test-q071", "practice-nail-test-q079", "practice-nail-test-q122",
        "practice-nail-test-q135", "practice-nail-test-q198", "practice-nail-test-q202",
        "practice-nail-test-q007", "practice-nail-test-q014", "practice-nail-test-q124",
        "practice-nail-test-q141", "practice-nail-test-q175", "practice-nail-test-n031",
    },
    "client-service-action": {
        "practice-nail-test-q043", "practice-nail-test-q074", "practice-nail-test-q103",
        "practice-nail-test-q136", "practice-nail-test-q167", "practice-nail-test-q176",
    },
    "acrylic-procedure": {
        "practice-nail-test-q067", "practice-nail-test-q158", "practice-nail-test-q164",
        "practice-nail-test-q186", "practice-nail-test-q201", "practice-nail-test-q059",
        "practice-nail-test-q063",
    },
    "nail-cleaning-tool": {
        "practice-nail-test-q119", "practice-nail-test-q126", "practice-nail-test-q057",
        "practice-nail-test-q094", "practice-nail-test-q194",
    },
    "purpose-result": {
        "practice-nail-test-q010", "practice-nail-test-q139", "practice-nail-test-q162",
        "practice-nail-test-q179", "practice-nail-test-q192", "practice-nail-test-q195",
        "practice-nail-test-n002",
    },
    "safety-document": {
        "practice-nail-test-q016", "practice-nail-test-q034", "practice-nail-test-q070",
        "practice-nail-test-q106", "practice-nail-test-q107", "practice-nail-test-q138",
        "practice-nail-test-q183", "practice-nail-test-q184", "practice-nail-test-n050",
    },
    "physical-chemistry-term": {
        "practice-nail-test-q095", "practice-nail-test-q100", "practice-nail-test-q101",
        "practice-nail-test-q123", "practice-nail-test-q178", "practice-nail-test-q189",
        "practice-nail-test-q190", "practice-nail-test-q191", "practice-nail-test-q192",
        "practice-nail-test-q046", "practice-nail-test-q061", "practice-nail-test-q129",
        "practice-nail-test-q160",
    },
    "anatomy-science-term": {
        "practice-nail-test-q086", "practice-nail-test-q111", "practice-nail-test-q166",
        "practice-nail-test-n014", "practice-nail-test-n048",
    },
    "bacteria-description": {
        "practice-nail-test-q036", "practice-nail-test-q125", "practice-nail-test-q161",
        "practice-nail-test-n012", "practice-nail-test-n016", "practice-nail-test-n020",
        "practice-nail-test-n025", "practice-nail-test-n047",
    },
    "career-health-concept": {
        "practice-nail-test-q040", "practice-nail-test-q082", "practice-nail-test-q096",
        "practice-nail-test-q177", "practice-nail-test-q193", "practice-nail-test-n008",
        "practice-nail-test-n010", "practice-nail-test-n011", "practice-nail-test-n036",
    },
    "massage-name": {
        "practice-nail-test-q002", "practice-nail-test-q076", "practice-nail-test-q080",
        "practice-nail-test-q083", "practice-nail-test-q115", "practice-nail-test-q130",
        "practice-nail-test-q144", "practice-nail-test-q145", "practice-nail-test-q148",
        "practice-nail-test-q188", "practice-nail-test-n045",
    },
    "gel-product": {
        "practice-nail-test-q027", "practice-nail-test-q056", "practice-nail-test-q062",
        "practice-nail-test-q078", "practice-nail-test-q128", "practice-nail-test-q142",
        "practice-nail-test-q154", "practice-nail-test-q155", "practice-nail-test-q169",
        "practice-nail-test-q172",
    },
    "acrylic-chemistry-product": {
        "practice-nail-test-q004", "practice-nail-test-q052", "practice-nail-test-q064",
        "practice-nail-test-q143", "practice-nail-test-q156", "practice-nail-test-q157",
        "practice-nail-test-q171", "practice-nail-test-q173", "practice-nail-test-n060",
    },
    "polish-product": {
        "practice-nail-test-q072", "practice-nail-test-q132", "practice-nail-test-q168",
        "practice-nail-test-n001", "practice-nail-test-n003", "practice-nail-test-n054",
        "practice-nail-test-n057",
    },
    "skin-nail-product": {
        "practice-nail-test-q065", "practice-nail-test-q084", "practice-nail-test-q149",
        "practice-nail-test-q165", "practice-nail-test-n021", "practice-nail-test-n022",
        "practice-nail-test-n027",
    },
    "service-problem-cause": {
        "practice-nail-test-q029", "practice-nail-test-q050", "practice-nail-test-q066",
        "practice-nail-test-q090", "practice-nail-test-q097", "practice-nail-test-q113",
        "practice-nail-test-q127", "practice-nail-test-q197",
    },
    "application-location": {
        "practice-nail-test-q051", "practice-nail-test-q093", "practice-nail-test-q152",
        "practice-nail-test-q204", "practice-nail-test-n040",
    },
    "toenail-method": {
        "practice-nail-test-q174", "practice-nail-test-q181", "practice-nail-test-q182",
        "practice-nail-test-q081", "practice-nail-test-q092",
    },
    "implement-use": {
        "practice-nail-test-q044", "practice-nail-test-q060", "practice-nail-test-q073",
        "practice-nail-test-q077", "practice-nail-test-q131", "practice-nail-test-q133",
        "practice-nail-test-q200", "practice-nail-test-n009", "practice-nail-test-n028",
    },
    "nail-condition-term": {
        "practice-nail-test-q049", "practice-nail-test-q091", "practice-nail-test-q140",
        "practice-nail-test-q150", "practice-nail-test-n013", "practice-nail-test-n015",
        "practice-nail-test-n026", "practice-nail-test-n039", "practice-nail-test-n042",
    },
    "time-frequency": {
        "practice-nail-test-q087", "practice-nail-test-q112", "practice-nail-test-q117",
        "practice-nail-test-q163", "practice-nail-test-q187", "practice-nail-test-n006",
        "practice-nail-test-n031",
    },
}

CURATED_GROUP_BY_ID = {
    item_id: group
    for group, item_ids in CURATED_DISTRACTOR_GROUPS.items()
    for item_id in item_ids
}

FAMILY_OVERRIDES = {
    "practice-nail-test-q086": "nerve",
    "practice-nail-test-q091": "bone",
    "practice-nail-test-q111": "bone",
    "practice-nail-test-q138": "organization",
    "practice-nail-test-q140": "nail-anatomy",
    "practice-nail-test-q150": "infection-term",
    "practice-nail-test-q163": "timing",
    "practice-nail-test-n015": "nail-anatomy",
    "practice-nail-test-n026": "nail-condition",
    "practice-nail-test-n031": "duration",
    "practice-nail-test-n033": "muscle",
    "practice-nail-test-n039": "nail-anatomy",
    "practice-nail-test-n042": "nail-condition",
}

# These pools are used only when the extracted open-ended source has too few
# same-family answers. Every option remains the same kind of thing the stem asks
# for; a noun, procedure, and body part are never mixed just to reach four choices.
FAMILY_FALLBACKS = {
    "organ": ["Liver", "Skin", "Kidneys", "Lungs", "Large intestine"],
    "angle": ["30 degrees", "45 degrees", "60 degrees", "90 degrees"],
    "bone": ["Patella", "Tibia", "Talus", "Humerus", "Ulna", "Metacarpals", "Metatarsals", "Calcaneus"],
    "muscle": ["Abductor muscle", "Adductor muscle", "Extensor muscle", "Flexor muscle", "Pronator muscle", "Supinator muscle"],
    "nerve": ["Ulnar nerve", "Digital nerve", "Median nerve", "Radial nerve"],
    "massage": ["Effleurage", "Petrissage", "Tapotement", "Vibration"],
    "nail-anatomy": ["Nail body", "Free edge", "Nail bed", "Nail matrix", "Nail root", "Hyponychium", "Eponychium", "Nail mantle"],
    "nail-condition": ["Onycholysis", "Onychauxis", "Onychophagy", "Onychorrhexis", "Leukonychia", "Onychia", "Verruca"],
    "nail-shape": ["Round", "Oval", "Square", "Squoval", "Almond", "Stiletto"],
    "infection-term": ["Cleaning", "Disinfection", "Sterilization", "Infection", "Immunity", "Sanitation"],
    "organization": ["OSHA", "EPA", "FDA", "CDC"],
    "duration": ["10 seconds", "20 seconds", "30 seconds", "60 seconds"],
    "percentage": ["25%", "50%", "75%", "99%"],
    "skin-layer": ["Epidermis", "Dermis", "Subcutaneous tissue", "Stratum corneum"],
    "timing": ["Before every client", "After every client", "Once a day", "Once a week"],
    "tool": ["Nail tip file", "Abrasive board", "Metal file", "Cuticle nippers", "A clean spatula", "A cotton-tipped wooden stick"],
}

AUTO_APPROVED_DISTRACTOR_FAMILIES = {
    "angle", "bone", "duration", "infection-term", "massage", "muscle",
    "nail-anatomy", "nail-condition", "nail-shape", "nerve", "organ",
    "organization", "skin-layer", "timing", "tool",
}

ANGLE_RE = re.compile(r"(\d+)\s*(?:degree|°)", re.I)


def git_commit() -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", "--short", "HEAD"], cwd=ROOT.parent, text=True).strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return "uncommitted"


def load_translator() -> dict[str, str]:
    table: dict[str, str] = {}
    overlay_path = ROOT / "glossary" / "en-zh-overlay.json"
    if overlay_path.exists():
        table.update(json.loads(overlay_path.read_text(encoding="utf-8")))
    glossary = json.loads(GLOSSARY_PATH.read_text(encoding="utf-8"))
    for term in glossary.get("terms", []):
        table[term["en"]] = term["zh"]
    normalized = {normalize_identity(key): value for key, value in table.items()}
    return table, normalized


def translate(text: str, exact: dict[str, str], normalized: dict[str, str]) -> str:
    if text in exact:
        return exact[text]
    hit = normalized.get(normalize_identity(text))
    if hit:
        return hit
    raise KeyError(text)


def identity_key(item: dict) -> tuple:
    stem = normalize_identity(item["questionEn"])
    if item["kind"] == "open-ended":
        return ("open", stem, item.get("answerEn") or "")
    choices = tuple(choice["en"] for choice in item.get("choices") or [])
    return ("mcq", stem, choices, item.get("keyedChoiceText") or "")


def source_rank(book: str) -> int:
    try:
        return FILE_ORDER.index(book)
    except ValueError:
        return 99


def collapse_duplicates(items: list[dict]) -> tuple[list[dict], list[dict]]:
    groups: dict[tuple, list[dict]] = {}
    for item in items:
        if item["status"] == "omitted":
            continue
        groups.setdefault(identity_key(item), []).append(item)
    collapsed: list[dict] = []
    notes: list[dict] = []
    used_ids = set()
    for item in items:
        if item["status"] == "omitted":
            collapsed.append(item)
            continue
        key = identity_key(item)
        group = groups[key]
        if item["id"] in used_ids:
            continue
        group_sorted = sorted(group, key=lambda row: (source_rank(row["book"]), row["id"]))
        canonical = dict(group_sorted[0])
        canonical["sources"] = [
            {"book": row["book"], "itemRef": row["itemRef"]} for row in group_sorted
        ]
        collapsed.append(canonical)
        used_ids.update(row["id"] for row in group_sorted)
        if len(group_sorted) > 1:
            notes.append({
                "canonicalId": canonical["id"],
                "collapsedIds": [row["id"] for row in group_sorted[1:]],
                "sources": canonical["sources"],
            })
    return collapsed, notes


def variant_notes(items: list[dict]) -> list[dict]:
    by_stem: dict[str, list[dict]] = {}
    for item in items:
        if item["status"] == "omitted":
            continue
        by_stem.setdefault(normalize_identity(item["questionEn"]), []).append(item)
    notes = []
    for stem, group in by_stem.items():
        if len(group) < 2:
            continue
        keys = {identity_key(item) for item in group}
        if len(keys) > 1:
            notes.append({
                "stem": group[0]["questionEn"][:120],
                "ids": [item["id"] for item in group],
                "reason": "same stem retained as variants because choices or keyed answers differ",
            })
    return notes


def dispute_reason(item: dict) -> str | None:
    if item["id"] in KNOWN_QUARANTINE:
        return KNOWN_QUARANTINE[item["id"]]
    if item["status"] == "omitted":
        return None
    stem = item["questionEn"].lower()
    key = (item.get("keyedChoiceText") or item.get("answerEn") or "").lower()
    if re.search(r"destroys?\s+all\s+microbial|all\s+microbial\s+life", stem):
        if "steril" not in key:
            return "infection-control ladder: destroying all microbial life is sterilization, not the Word key"
    if "process of disinfecting" in stem and "steril" in key:
        return "infection-control ladder: disinfection is not sterilization"
    if "lowest level of infection control" in stem and "steril" in key:
        return "infection-control ladder: sterilization is the highest level, not the lowest"
    if re.search(r"disinfectants?\s+can\s+kill\s+everything\s+except", stem) is None:
        if "disinfect" in stem and "spore" in stem and "kill" in stem and "except" not in stem:
            if "spore" in key and "except" not in item["questionEn"].lower():
                return "infection-control ladder: disinfectants do not kill bacterial spores"
    return None


def topic_tags(item: dict) -> set[str]:
    blob = f"{item.get('displayQuestionEn') or item.get('questionEn', '')} {item.get('displayAnswerEn') or item.get('answerEn', '')} {item.get('keyedChoiceText', '')}".lower()
    rules = {
        "electric-file": ("electric file", "carbide", "fire ring"),
        "acrylic": ("acrylic", "monomer", "polymer", "primer", "methacryl", "cross-link"),
        "gel": ("gel", "uv light", "led light", "sticky residue", "curing"),
        "infection-control": ("steril", "disinfect", "sanit", "bacteria", "pathogen", "quat", "infection", "spore", "germ"),
        "anatomy": ("bone", "muscle", "nerve", "organ", "tissue", "patella", "tibia", "talus", "humerus", "ulna", "phalang"),
        "nail-anatomy": ("hyponychium", "eponychium", "cuticle", "matrix", "lunula", "free edge", "nail bed", "nail body", "nail root", "mantle", "nail plate"),
        "nail-condition": ("onych", "paronych", "fungus", "verruca", "ringworm", "hangnail", "nail disease", "nail disorder"),
        "massage": ("massage", "tapotement", "effleurage", "petrissage", "shiatsu", "stroking", "kneading", "tapping", "gliding"),
        "pedicure": ("pedicure", "foot", "feet", "toe", "foot bath", "foot basin"),
        "manicure": ("manicure", "hand", "finger"),
        "polish": ("polish", "enamel", "top coat", "nitrocellulose", "remover"),
        "skin": ("skin", "epidermis", "dermis", "callus", "sebum", "sweat"),
        "safety": ("msds", "sds", "osha", "fda", "protective", "allerg", "exposure", "fumes"),
        "service": ("service", "client", "technician", "salon", "appointment", "consultation"),
        "chemistry": ("chemical", "solution", "solvent", "catalyst", "reaction", "ph scale", "ingredient", "adhesive"),
    }
    tags = {tag for tag, words in rules.items() if any(word in blob for word in words)}
    return tags or {"general"}


def answer_family(item: dict) -> str:
    if item["id"] in FAMILY_OVERRIDES:
        return FAMILY_OVERRIDES[item["id"]]
    curated = CURATED_GROUP_BY_ID.get(item["id"])
    if curated:
        return f"curated:{curated}"
    question = (item.get("displayQuestionEn") or item["questionEn"]).lower()
    answer = (item.get("displayAnswerEn") or item.get("answerEn") or item.get("keyedChoiceText") or "").lower()
    blob = f"{question} {answer}"
    if ANGLE_RE.search(blob) or "what angle" in question:
        return "angle"
    if re.search(r"\borganization\b", question) or re.search(r"\b(osha|epa|fda|cdc)\b", answer):
        return "organization"
    if re.search(r"\borgans?\b", question):
        return "organ"
    if ("which nerve" in question or "what nerve" in question or "nerve that" in question) and "function" not in question:
        return "nerve"
    if "bone" in question or any(word in answer for word in ("patella", "tibia", "talus", "humerus", "ulna", "metacarp", "metatars", "calcaneus", "phalan")):
        return "bone"
    if "muscle" in question or any(word in answer for word in ("abductor", "adductor", "extensor", "flexor", "pronator", "supinator")):
        return "muscle"
    if any(word in blob for word in ("tapotement", "effleurage", "petrissage", "shiatsu")) or "massage technique" in question or "massage movement" in question:
        return "massage"
    if "massage" in question and any(word in question for word in ("called", "name", "technique", "movement")):
        return "massage"
    if any(phrase in question for phrase in ("what tool", "which tool", "what file", "which file", "what kind of brush", "what material", "what is used to file", "what should be used to remove cream")):
        return "tool"
    if "nail shape" in question or "nail tip shape" in question or any(value == answer.strip() for value in ("round", "oval", "square", "squoval", "almond")) or "stiletto" in answer:
        return "nail-shape"
    if "condition called" in question or ("what is" in question and re.search(r"\b(?:onych|leuconych)", question)):
        return "nail-condition"
    if any(word in blob for word in ("hyponychium", "eponychium", "nail body", "free edge", "nail bed", "nail matrix", "nail root", "nail mantle", "lunula")):
        return "nail-anatomy"
    if re.search(r"\bonych", blob) or any(word in blob for word in ("verruca", "ringworm", "tinea", "hangnail")):
        return "nail-condition"
    if any(word in blob for word in ("epidermis", "dermis", "subcutaneous", "stratum corneum")):
        return "skin-layer"
    if "percentage" in question or "what percent" in question:
        return "percentage"
    if any(phrase in question for phrase in ("how long", "for at least", "for a period")):
        return "duration"
    if any(word in blob for word in ("sterilization", "disinfection", "sanitation", "immunity", "infection")) and ("called" in question or "term" in question or "process" in question or len(answer.split()) <= 3):
        return "infection-term"
    if any(phrase in question for phrase in ("what is the purpose", "what is the benefit", "because")):
        return "purpose"
    if any(phrase in question for phrase in ("where should", "where can", "where is", "where does", "where ", "at what point")):
        return "location"
    if any(phrase in question for phrase in ("when should", "how often", "before?", "after every")):
        return "timing"
    if question.startswith("how") and answer.startswith(("with ", "by ", "horizontally", "straight", "flat", "securely", "according ")):
        return "method-or-manner"
    if answer.startswith(("to ", "by ", "at ", "when ", "from ", "keep ", "use ", "apply ", "wipe ", "soak ", "rinse ", "stop ", "avoid ", "continue ", "put ", "change ", "reduce ", "wear ", "schedule ", "recommend ", "assess ", "remove ", "disinfect ")):
        return "action-or-procedure"
    if any(phrase in question for phrase in ("what is the purpose", "what should", "what to ", "how should", "how to ", "when should", "where should")) and len(answer.split()) >= 3:
        return "action-or-procedure"
    if answer.startswith(("incorrect ", "too much ", "the lamp ", "the product ", "they appear ")) or any(phrase in question for phrase in ("what might be the cause", "what is the cause", "likely cause", "likely issue", "what happens if")):
        return "cause-or-result"
    product_pattern = r"\b(?:gel|polish|oil|remover|disinfectant|antiseptic|bleach|acetone|monomer|polymer|primer|adhesive|resin|oligomer|acid|alcohol|exfoliants?|nail tips?)\b|full-cover"
    if any(phrase in question for phrase in ("which product", "what product", "what substance", "which substance", "what ingredient", "main ingredient", "what gel", "type of gel", "polish remover", "what solution", "what should be applied")) or re.search(product_pattern, answer):
        return "product-or-substance"
    if any(word in answer for word in ("file", "nippers", "spatula", "stick", "brush", "implement", "equipment", "gear", "mask", " bit")):
        return "tool"
    if answer.startswith(("with ", "by ", "horizontally", "straight", "flat", "securely", "according ")):
        return "method-or-manner"
    if len(answer.split()) >= 5:
        return "action-or-procedure"
    return "technical-term"


def semantic_key(value: str) -> str:
    key = normalize_identity(value)
    aliases = {
        "shin bone or tibia": "tibia", "the shin bone": "tibia", "the tibia": "tibia",
        "a verruca": "verruca", "nail free edge": "free edge", "the nail bed": "nail bed",
        "uv gel": "gel", "household bleach": "bleach", "floor cleaner or bleach": "bleach",
        "wipe with alcohol": "wipe alcohol", "wipe with cotton ball soaked in 99 isopropyl alcohol": "wipe alcohol",
        "continue soaking in acetone": "soak acetone", "soak in acetone": "soak acetone",
        "45 degrees": "45 degrees", "at a 45 degree angle to the nail surface": "45 degrees",
        "shiatsu or effeurage": "effleurage", "effeurage": "effleurage",
        "uv gel": "gel", "gel": "gel",
        "calcaneus is the largest bone in the foot femur is the largest bone in the leg": "calcaneus",
    }
    return aliases.get(key, key)


def add_distractors(items: list[dict]) -> None:
    open_items = [
        item for item in items
        if item["status"] in {"staging", "quarantined"} and item["kind"] == "open-ended" and item.get("answerEn")
    ]
    pools: dict[str, list[dict]] = {}
    for item in open_items:
        family = answer_family(item)
        for answer in [item.get("displayAnswerEn") or item["answerEn"]]:
            pools.setdefault(family, []).append({
                "answer": answer,
                "topics": topic_tags(item),
                "question": item["questionEn"],
            })

    for item in items:
        if item["status"] not in {"staging", "quarantined"} or item["kind"] != "open-ended" or not item.get("answerEn"):
            continue
        correct = item.get("displayAnswerEn") or item["answerEn"]
        correct_norm = semantic_key(correct)
        positioned = POSITIONED_DISTRACTOR_OVERRIDES.get(item["id"])
        if positioned:
            correct_letters = sorted(set("abcd") - set(positioned))
            if len(correct_letters) != 1:
                raise ValueError(f"{item['id']}: positioned distractors must use exactly three choice letters")
            correct_letter = correct_letters[0]
            choices = [{"id": letter, "en": text, "zh": ""} for letter, text in positioned.items()]
            choices.append({"id": correct_letter, "en": correct, "zh": ""})
            choices.sort(key=lambda row: row["id"])
            item["choices"] = choices
            item["correctChoice"] = correct_letter
            item["choicesOrigin"] = "authored-distractors"
            item["distractorFamily"] = f"curated:positioned:{item['id']}"
            item["keyedChoiceText"] = correct
            continue
        family = answer_family(item)
        topics = topic_tags(item)
        candidates = []
        seen = {correct_norm}
        authored = DISTRACTOR_OVERRIDES.get(item["id"])
        source_candidates = [] if family in FAMILY_FALLBACKS or authored else pools.get(family, [])
        for candidate in source_candidates:
            answer = candidate["answer"]
            key = semantic_key(answer)
            if key in seen:
                continue
            seen.add(key)
            overlap = len(topics & candidate["topics"])
            specificity = 0 if candidate["topics"] == {"general"} else len(candidate["topics"])
            tie = int(__import__("hashlib").sha256(f"{item['id']}|{answer}".encode("utf-8")).hexdigest()[:8], 16)
            candidates.append((overlap, specificity, tie, answer))
        for answer in (authored or FAMILY_FALLBACKS.get(family, [])):
            key = semantic_key(answer)
            if key in seen:
                continue
            seen.add(key)
            candidates.append((0, 0, int(__import__("hashlib").sha256(f"{item['id']}|{answer}".encode("utf-8")).hexdigest()[:8], 16), answer))
        candidates.sort(key=lambda row: (-row[0], -row[1], row[2]))
        candidate_answers = [row[3] for row in candidates]
        if len(candidate_answers) < 3:
            item["status"] = "omitted"
            item["omitReason"] = "unrecoverable: could not author three distinct distractors"
            continue
        rng = random.Random(int(__import__("hashlib").sha256(item["id"].encode("utf-8")).hexdigest()[:8], 16))
        distractors = candidate_answers[:3]
        rng.shuffle(distractors)
        letters = ["a", "b", "c", "d"]
        rng.shuffle(letters)
        correct_letter = letters[0]
        wrong_letters = letters[1:]
        choices = []
        for letter, text in zip(wrong_letters, distractors):
            choices.append({"id": letter, "en": text, "zh": ""})
        choices.append({"id": correct_letter, "en": correct, "zh": ""})
        choices.sort(key=lambda row: row["id"])
        item["choices"] = choices
        item["correctChoice"] = correct_letter
        item["choicesOrigin"] = "authored-distractors"
        item["distractorFamily"] = family
        item["keyedChoiceText"] = correct


# Teaching copy is intentionally data-driven. The builder must never author or
# approve learner-facing explanations from question text or choice order.

def to_question_record(item: dict, exact: dict[str, str], normalized: dict[str, str]) -> dict:
    sources = item.get("sources") or [{"book": item["book"], "itemRef": item["itemRef"]}]
    choices = []
    source_choice_corrections = []
    choice_overrides = SOURCE_CHOICE_DISPLAY_OVERRIDES.get(item["id"], {})
    for choice in item.get("choices") or []:
        source_en = choice["en"]
        display_override = choice_overrides.get(choice["id"])
        en = display_override["en"] if display_override else source_en
        zh = display_override["zh"] if display_override else (choice.get("zh") or translate(en, exact, normalized))
        rendered_choice = {"id": choice["id"], "en": en, "zh": zh}
        if display_override:
            rendered_choice["sourceEn"] = source_en
            source_choice_corrections.append({
                "choiceId": choice["id"],
                "sourceEn": source_en,
                "displayEn": en,
                "reason": display_override["reason"],
            })
        choices.append(rendered_choice)
    question_en = item.get("displayQuestionEn") or item["questionEn"]
    record = {
        "id": item["id"],
        "section": "practice",
        "chapter": 0,
        "chapterTitle": {"en": "Practice", "zh": "练习"},
        "collection": "practice-pool",
        "type": "multiple-choice",
        "question": {
            "en": question_en,
            "zh": (QUESTION_OVERRIDES.get(item["id"], {}).get("questionZh") or translate(question_en, exact, normalized)),
        },
        "choices": choices,
        "correctChoice": item.get("correctChoice") or item.get("normalizedKey") or "",
        "sources": sources,
        "choicesOrigin": item.get("choicesOrigin") or ("source" if item["kind"] == "source-mcq" else "authored-distractors"),
        "status": item["status"],
        "questionEn": item["questionEn"],
        "answerEn": item.get("answerEn") or item.get("keyedChoiceText") or "",
        "rawKey": item.get("rawKey") or "",
        "normalizedKey": item.get("normalizedKey") or "",
        "keyedChoiceText": item.get("keyedChoiceText") or "",
        "kind": item["kind"],
    }
    if item.get("displayAnswerEn"):
        record["displayAnswerEn"] = item["displayAnswerEn"]
    if item.get("displayQuestionEn"):
        record["displayQuestionEn"] = item["displayQuestionEn"]
    if item.get("distractorFamily"):
        record["distractorFamily"] = item["distractorFamily"]
    if source_choice_corrections:
        record["sourceChoiceCorrections"] = source_choice_corrections
    if item.get("omitReason"):
        record["omitReason"] = item["omitReason"]
    if item.get("verificationWarning"):
        record["verificationWarning"] = item["verificationWarning"]
    if item.get("disputeReason"):
        record["disputeReason"] = item["disputeReason"]
    if item.get("sourceWarning"):
        record["sourceWarning"] = SOURCE_WARNING
        record["auditNote"] = item["sourceWarning"]
    if item.get("authorityRefs"):
        record["authorityRefs"] = item["authorityRefs"]
    if item.get("explanation"):
        record["explanation"] = item["explanation"]
    if item.get("lockPoint"):
        record["lockPoint"] = item["lockPoint"]
    return record


def read_id_keyed_document(path: Path, field: str) -> dict[str, dict]:
    if not path.exists():
        raise FileNotFoundError(f"required review artifact is missing: {path}")
    payload = json.loads(path.read_text(encoding="utf-8"))
    values = payload.get(field)
    if not isinstance(values, dict):
        raise ValueError(f"{path.name}: {field} must be an object keyed by stable question ID")
    for record_id, value in values.items():
        if not isinstance(value, dict) or value.get("id", record_id) != record_id:
            raise ValueError(f"{path.name}: malformed entry for {record_id}")
    return values


def expand_batch_authored_entries(batch_docs: list[dict]) -> dict[str, dict]:
    entries = {}
    for batch in batch_docs:
        author = batch.get("author", "")
        authored_at = batch.get("authoredAt", "")
        default_source = batch.get("authoritySource", "")
        for record_id, compact in (batch.get("entries") or {}).items():
            why = compact.get("why") or []
            lock = compact.get("lock") or []
            refs = []
            for ref in compact.get("refs") or []:
                if isinstance(ref, dict):
                    refs.append(ref)
                else:
                    section, printed_page, pdf_page = ref
                    refs.append({
                        "source": default_source,
                        "section": section,
                        "printedPage": printed_page,
                        "pdfPage": pdf_page,
                    })
            entry = {
                "id": record_id,
                "explanation": {"en": why[0] if len(why) > 0 else "", "zh": why[1] if len(why) > 1 else ""},
                "lockPoint": {"en": lock[0] if len(lock) > 0 else "", "zh": lock[1] if len(lock) > 1 else ""},
                "teachingRelation": compact.get("relation", ""),
                "authorityRefs": refs,
                "author": author,
                "authoredAt": authored_at,
            }
            if compact.get("definedExamTerms"):
                entry["definedExamTerms"] = compact["definedExamTerms"]
            entries[record_id] = entry
    return entries


def candidate_content_hash(record: dict, authored: dict) -> str:
    candidate = deepcopy(record)
    candidate["status"] = "approved"
    candidate["explanation"] = authored["explanation"]
    candidate["lockPoint"] = authored["lockPoint"]
    return content_hash(candidate)


def has_complete_review(record: dict, authored: dict, decision: dict) -> bool:
    if any(decision.get(field) != "pass" for field in PASS_STATUSES):
        return False
    if decision.get("contentHash") != candidate_content_hash(record, authored):
        return False
    author = authored.get("author", "").strip()
    reviewers = {
        decision.get("answerReviewer", "").strip(),
        decision.get("teachingReviewer", "").strip(),
        decision.get("englishReviewer", "").strip(),
        decision.get("chineseReviewer", "").strip(),
    }
    if not author or "" in reviewers or author in reviewers:
        return False
    dates = (
        decision.get("answerReviewedAt"),
        decision.get("teachingReviewedAt"),
        decision.get("englishReviewedAt"),
        decision.get("chineseReviewedAt"),
    )
    if not all(dates):
        return False
    if record.get("sourceWarning"):
        if decision.get("resolutionOutcome") not in RESOLUTION_OUTCOMES:
            return False
        if not decision.get("resolutionNote") or not decision.get("resolutionAuthorityRefs"):
            return False
    return True


def apply_authored_review_state(record: dict, authored: dict | None, decision: dict | None) -> None:
    if record["status"] == "omitted":
        return
    if record.get("sourceWarning"):
        if not authored or not decision or not has_complete_review(record, authored, decision):
            record["status"] = "quarantined"
            record["disputeReason"] = record.get("auditNote") or "unresolved source warning"
    if record["status"] == "quarantined":
        return
    record["status"] = "staging"
    if not authored:
        return
    record["explanation"] = authored["explanation"]
    record["lockPoint"] = authored["lockPoint"]
    record["teachingRelation"] = authored["teachingRelation"]
    record["authorityRefs"] = authored["authorityRefs"]
    record["teachingAuthor"] = authored["author"]
    record["authoredAt"] = authored["authoredAt"]
    record["reviewCandidateHash"] = candidate_content_hash(record, authored)
    if decision and has_complete_review(record, authored, decision):
        if decision.get("resolutionOutcome") == "omitted":
            record["status"] = "omitted"
            record["omitReason"] = decision["resolutionNote"]
        else:
            record["status"] = "approved"


def attach_review_reasons(records: list[dict], review_reasons: dict[str, dict]) -> None:
    missing = []
    for record in records:
        if record["status"] != "quarantined":
            continue
        reason = review_reasons.get(record["id"])
        en = (reason or {}).get("en", "").strip()
        zh = (reason or {}).get("zh", "").strip()
        if not en or not zh:
            missing.append(record["id"])
            continue
        record["reviewReason"] = {"en": en, "zh": zh}
    if missing:
        raise ValueError(f"quarantined records missing bilingual reviewReason: {missing}")


def learner_held_questions(records: list[dict]) -> list[dict]:
    held = []
    for record in records:
        if record["status"] != "quarantined":
            continue
        correct = next((choice for choice in record.get("choices") or [] if choice["id"] == record.get("correctChoice")), None)
        source_answer = {
            "en": record.get("answerEn") or (correct or {}).get("en") or record.get("keyedChoiceText") or "",
            "zh": (correct or {}).get("zh") or "",
        }
        held.append({
            "id": record["id"],
            "question": record["question"],
            "choices": record.get("choices") or [],
            "sourceAnswer": source_answer,
            "sources": record.get("sources") or [],
            "reviewReason": record["reviewReason"],
            "authorityRefs": record.get("authorityRefs") or [],
        })
    return held


def ledger_row(record: dict, authored: dict | None, decision: dict | None) -> dict:
    decision = decision or {}
    status = record["status"]
    if status == "omitted":
        transcription = "omitted"
        teaching = "not-applicable"
        dispute = "none"
        answer = "not-reviewed"
        refs = record.get("authorityRefs") or []
    elif status == "quarantined":
        transcription = "pass"
        teaching = "not-reviewed"
        dispute = "quarantined"
        answer = "disputed"
        refs = record.get("authorityRefs") or []
    else:
        transcription = "pass"
        teaching = decision.get("teachingCopyStatus", "not-reviewed")
        dispute = "resolved" if decision.get("resolutionOutcome") in RESOLUTION_OUTCOMES else "none"
        answer = decision.get("answerReviewStatus", "not-reviewed")
        refs = (authored or {}).get("authorityRefs", [])
    return {
        "id": record["id"],
        "contentHash": content_hash(record),
        "reviewCandidateHash": record.get("reviewCandidateHash", ""),
        "transcriptionStatus": transcription,
        "teachingCopyStatus": teaching,
        "englishReviewStatus": decision.get("englishReviewStatus", "not-reviewed"),
        "chineseReviewStatus": decision.get("chineseReviewStatus", "not-reviewed"),
        "disputeStatus": dispute,
        "answerReviewStatus": answer,
        "authorityRefs": refs,
        "author": (authored or {}).get("author", ""),
        "authoredAt": (authored or {}).get("authoredAt", ""),
        "answerReviewer": decision.get("answerReviewer", ""),
        "teachingReviewer": decision.get("teachingReviewer", ""),
        "englishReviewer": decision.get("englishReviewer", ""),
        "chineseReviewer": decision.get("chineseReviewer", ""),
        "answerReviewedAt": decision.get("answerReviewedAt", ""),
        "teachingReviewedAt": decision.get("teachingReviewedAt", ""),
        "englishReviewedAt": decision.get("englishReviewedAt", ""),
        "chineseReviewedAt": decision.get("chineseReviewedAt", ""),
        "resolutionOutcome": decision.get("resolutionOutcome", ""),
        "resolutionNote": decision.get("resolutionNote", ""),
        "resolutionAuthorityRefs": decision.get("resolutionAuthorityRefs", []),
        "reviewNotes": decision.get("reviewNotes", ""),
    }


def escape_html(value: str) -> str:
    return (
        str(value)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def render_review(records: list[dict], ledger_rows: list[dict], title: str = "Practice pool review") -> str:
    ledger = {row["id"]: row for row in ledger_rows}
    cards = []
    for record in records:
        review = ledger[record["id"]]
        choices = []
        for choice in record.get("choices") or []:
            correct = choice["id"] == record.get("correctChoice")
            origin = "source" if record.get("choicesOrigin") == "source" else "authored"
            choices.append(
                f'<li class="{"correct" if correct else ""}"><span class="choice-id">{escape_html(choice["id"])}.</span> '
                f'<span lang="en">{escape_html(choice["en"])}</span><br><span lang="zh-Hans">{escape_html(choice["zh"])}</span>'
                f'{" <strong>✓ Correct</strong>" if correct else ""} <em>({origin})</em></li>'
            )
        banner = ""
        if record["status"] == "quarantined":
            banner = f'<p class="dispute">Quarantined: {escape_html(record.get("disputeReason") or "")}</p>'
        elif record["status"] == "omitted":
            banner = f'<p class="warning">Omitted: {escape_html(record.get("omitReason") or "")}</p>'
        elif record.get("sourceWarning"):
            banner = (
                f'<p class="warning"><strong>Source note / 资料说明:</strong><br>'
                f'{escape_html(record["sourceWarning"]["en"])}<br>'
                f'{escape_html(record["sourceWarning"]["zh"])}</p>'
            )
        teaching = ""
        if record.get("explanation") and record.get("lockPoint"):
            teaching = (
                f'<p><strong>Why / 为什么</strong><br lang="en">{escape_html(record["explanation"]["en"])}'
                f'<br lang="zh-Hans">{escape_html(record["explanation"]["zh"])}</p>'
                f'<p><strong>Lock this / 记重点</strong><br lang="en">{escape_html(record["lockPoint"]["en"])}'
                f'<br lang="zh-Hans">{escape_html(record["lockPoint"]["zh"])}</p>'
            )
        refs = "".join(
            f'<li>{escape_html(ref.get("source", ""))} - {escape_html(ref.get("section", ""))} '
            f'(printed p. {escape_html(ref.get("printedPage", ""))}; PDF p. {escape_html(ref.get("pdfPage", ""))})</li>'
            for ref in review.get("authorityRefs") or []
        )
        source_answer = next(
            (choice["en"] for choice in record.get("choices") or [] if choice["id"] == record.get("correctChoice")),
            record.get("answerEn") or record.get("keyedChoiceText") or "",
        )
        review_summary = (
            f'<dl class="review-grid"><dt>Answer review</dt><dd>{escape_html(review["answerReviewStatus"])}</dd>'
            f'<dt>Teaching review</dt><dd>{escape_html(review["teachingCopyStatus"])}</dd>'
            f'<dt>English review</dt><dd>{escape_html(review["englishReviewStatus"])}</dd>'
            f'<dt>Chinese review</dt><dd>{escape_html(review["chineseReviewStatus"])}</dd>'
            f'<dt>Dispute</dt><dd>{escape_html(review["disputeStatus"])}</dd></dl>'
        )
        cards.append(
            f'<article id="{escape_html(record["id"])}" class="{escape_html(record["status"])}">'
            f'<header><strong>{escape_html(record["id"])}</strong> · {escape_html(record["status"])} · '
            f'{escape_html(record.get("choicesOrigin") or "")}</header>'
            f'{banner}'
            f'<details><summary>Source and review evidence</summary>'
            f'<p><strong>Source stem:</strong> {escape_html(record.get("questionEn") or record["question"]["en"])}</p>'
            f'<p><strong>Source answer:</strong> {escape_html(source_answer)}</p>'
            f'<p><strong>Source audit note:</strong> {escape_html(record.get("auditNote") or "None")}</p>'
            f'{review_summary}<p><strong>Candidate hash:</strong> <code>{escape_html(record.get("reviewCandidateHash") or "not authored")}</code></p>'
            f'<p><strong>Authority</strong></p><ul>{refs or "<li>Not yet authored</li>"}</ul></details>'
            f'<p lang="en" class="question">{escape_html(record["question"]["en"])}</p>'
            f'<p lang="zh-Hans" class="question">{escape_html(record["question"]["zh"])}</p>'
            f'<ol>{"".join(choices)}</ol>{teaching}</article>'
        )
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape_html(title)}</title>
<style>
:root{{color-scheme:light;font-family:Inter,system-ui,-apple-system,"Noto Sans SC",sans-serif;background:#f5f3ff;color:#241b35}}
body{{max-width:960px;margin:auto;padding:32px 20px 64px}}article{{background:white;border:1px solid #ddd6fe;border-radius:14px;padding:22px;margin:18px 0}}
.correct{{border-left:4px solid #16a34a;background:#f0fdf4;padding:8px}}li{{padding:8px 10px;margin:6px 0;background:#faf8ff;list-style:none}}
.dispute{{color:#9a3412;background:#fff7ed;padding:10px;border-radius:8px}}.warning{{color:#1e3a8a;background:#eff6ff;padding:10px;border-radius:8px}}
.quarantined{{border-color:#fb923c}}.omitted{{opacity:.75}}
.review-grid{{display:grid;grid-template-columns:max-content 1fr;gap:4px 14px}}.review-grid dt{{font-weight:700}}code{{overflow-wrap:anywhere}}
</style>
</head>
<body>
<h1>{escape_html(title)}</h1>
<p lang="zh-Hans">练习题库人工审核 · {len(records)} records</p>
<p class="warning"><strong>Containment:</strong> legacy teaching copy is invalidated. Only records with independent answer, teaching, English, and Chinese passes may enter the release pool.</p>
{''.join(cards)}
</body>
</html>
"""


def write_discrepancies(omitted, quarantined, collapses, variants, ocr, id_notes) -> None:
    lines = [
        "# Practice pool discrepancies",
        "",
        "Staging is source-faithful to the Word files. Shipped items are transcription-checked, fact-signed, and review-gated.",
        "Do not call the whole product 100% accurate while Word keys can be factually wrong.",
        "",
        "## Omitted items",
        "",
    ]
    if not omitted:
        lines.append("None.")
    for item in omitted:
        lines.append(f"- `{item['id']}`: {item.get('omitReason')}")
        lines.append(f"  - stem: {item['question']['en'][:160]}")
    lines += ["", "## Quarantined (not shipped)", ""]
    if not quarantined:
        lines.append("None.")
    for item in quarantined:
        lines.append(f"- `{item['id']}`: {item.get('disputeReason')}")
        lines.append(f"  - Word key: `{item.get('normalizedKey')}` ({item.get('keyedChoiceText')})")
    lines += ["", "## OCR / key-letter normalizations", ""]
    if not ocr:
        lines.append("None.")
    for item in ocr:
        lines.append(f"- `{item['id']}`: raw `{item.get('rawKey')}` → normalized `{item.get('normalizedKey')}`")
    lines += ["", "## Duplicate collapses", ""]
    if not collapses:
        lines.append("None.")
    for note in collapses:
        lines.append(f"- canonical `{note['canonicalId']}` absorbed `{', '.join(note['collapsedIds'])}`")
    lines += ["", "## Variant retentions (same stem, different choices or keys)", ""]
    if not variants:
        lines.append("None.")
    for note in variants:
        lines.append(f"- {', '.join(f'`{i}`' for i in note['ids'])}: {note['reason']}")
    lines += [
        "",
        "## ID-map notes",
        "",
        "A prior inventory said NAIL TEST numbered items 1–2 were missing; they are present (`practice-nail-test-n001`, `n002`) without a period after the number.",
        "Comprehensive #116 and #168 are present; stems have no space after `N.`.",
        *id_notes,
        "",
    ]
    REPORTS.mkdir(parents=True, exist_ok=True)
    (REPORTS / "discrepancies.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    batch_docs = [json.loads(path.read_text(encoding="utf-8")) for path in sorted(BATCHES_PATH.glob("*.json"))]
    authored_entries = read_id_keyed_document(TEACHING_COPY_PATH, "entries")
    batch_authored_entries = expand_batch_authored_entries(batch_docs)
    duplicate_authored_ids = sorted(set(authored_entries) & set(batch_authored_entries))
    if duplicate_authored_ids:
        raise ValueError(f"duplicate authored IDs across teaching-copy stores: {duplicate_authored_ids}")
    authored_entries.update(batch_authored_entries)
    review_decisions = read_id_keyed_document(REVIEW_DECISIONS_PATH, "records")
    review_reasons = read_id_keyed_document(REVIEW_REASONS_PATH, "records")
    calibration_doc = json.loads(CALIBRATION_PATH.read_text(encoding="utf-8"))
    calibration_ids = calibration_doc.get("safeTeachingCopyIds", []) + calibration_doc.get("disputeCalibrationIds", [])
    exact, normalized = load_translator()
    extracted = extract_all()
    for item in extracted:
        answer_override = ANSWER_OVERRIDES.get(item["id"])
        if answer_override and item.get("answerEn"):
            item["displayAnswerEn"] = answer_override
        override = QUESTION_OVERRIDES.get(item["id"])
        if override:
            item["displayQuestionEn"] = override["questionEn"]
    collapsed, collapse_notes = collapse_duplicates(extracted)
    variants = variant_notes(collapsed)

    for item in collapsed:
        reason = dispute_reason(item)
        if reason and item["status"] != "omitted":
            item["sourceWarning"] = reason
            if item["id"] in KNOWN_QUARANTINE_AUTHORITY_REFS:
                item["authorityRefs"] = KNOWN_QUARANTINE_AUTHORITY_REFS[item["id"]]

    add_distractors(collapsed)

    for item in collapsed:
        if (
            item.get("kind") == "open-ended"
            and item.get("status") == "staging"
            and item.get("distractorFamily") not in AUTO_APPROVED_DISTRACTOR_FAMILIES
            and not (item.get("distractorFamily") or "").startswith("curated:")
            and item["id"] not in DISTRACTOR_OVERRIDES
        ):
            item["status"] = "quarantined"
            item["disputeReason"] = (
                "Question-specific distractors are still required. The answer belongs to a broad "
                f"'{item.get('distractorFamily')}' family where automatic pooling cannot guarantee three "
                "credible, parallel choices."
            )

    records = []
    missing_zh = []
    for item in collapsed:
        if item["kind"] == "source-mcq" and item["status"] != "omitted":
            item["correctChoice"] = item.get("normalizedKey") or item.get("correctChoice")
        try:
            if item["status"] != "omitted" and not item.get("choices"):
                raise KeyError("no choices")
            if item["status"] == "omitted":
                item.setdefault("choices", [])
                item.setdefault("correctChoice", "")
                record = {
                    "id": item["id"],
                    "section": "practice",
                    "chapter": 0,
                    "chapterTitle": {"en": "Practice", "zh": "练习"},
                    "collection": "practice-pool",
                    "type": "multiple-choice",
                    "question": {"en": item["questionEn"], "zh": "（已省略）"},
                    "choices": [],
                    "correctChoice": "",
                    "sources": item.get("sources") or [{"book": item["book"], "itemRef": item["itemRef"]}],
                    "choicesOrigin": item.get("choicesOrigin") or "",
                    "status": "omitted",
                    "omitReason": item.get("omitReason") or "",
                    "questionEn": item["questionEn"],
                    "answerEn": item.get("answerEn") or "",
                    "rawKey": item.get("rawKey") or "",
                    "normalizedKey": item.get("normalizedKey") or "",
                    "keyedChoiceText": item.get("keyedChoiceText") or "",
                    "kind": item["kind"],
                }
            else:
                record = to_question_record(item, exact, normalized)
            records.append(record)
        except KeyError as error:
            missing_zh.append(f"{item['id']}: {error}")

    if missing_zh:
        print("Missing translations:", file=sys.stderr)
        for row in missing_zh[:30]:
            print(f"  {row}", file=sys.stderr)
        return 1

    record_ids = {record["id"] for record in records}
    unknown_authored = sorted(set(authored_entries) - record_ids)
    unknown_decisions = sorted(set(review_decisions) - record_ids)
    unknown_review_reasons = sorted(set(review_reasons) - record_ids)
    if unknown_authored or unknown_decisions or unknown_review_reasons:
        raise ValueError(
            "unknown stable IDs in review artifacts: "
            f"authored={unknown_authored}, decisions={unknown_decisions}, reviewReasons={unknown_review_reasons}"
        )
    unknown_calibration = sorted(set(calibration_ids) - record_ids)
    if unknown_calibration or len(calibration_ids) != 24 or len(set(calibration_ids)) != 24:
        raise ValueError(f"calibration set must contain 24 unique live IDs; unknown={unknown_calibration}")
    for batch in batch_docs:
        batch_id = batch.get("id", "")
        batch_question_ids = batch.get("questionIds", [])
        batch_quarantine_ids = batch.get("newQuarantineIds", [])
        batch_ids = batch_question_ids + batch_quarantine_ids
        unknown_batch_ids = sorted(set(batch_ids) - record_ids)
        if not re.fullmatch(r"[a-z0-9-]+", batch_id):
            raise ValueError(f"invalid batch id: {batch_id!r}")
        if unknown_batch_ids or len(batch_ids) != len(set(batch_ids)):
            raise ValueError(f"batch {batch_id} has duplicate or unknown IDs: {unknown_batch_ids}")
        unauthored_batch_ids = sorted(set(batch_question_ids) - set(authored_entries))
        if unauthored_batch_ids:
            raise ValueError(f"batch {batch_id} lists unauthored IDs: {unauthored_batch_ids}")
        unlisted_batch_entries = sorted(set((batch.get("entries") or {})) - set(batch_question_ids))
        if unlisted_batch_entries:
            raise ValueError(f"batch {batch_id} has entries missing from questionIds: {unlisted_batch_entries}")

    for record in records:
        apply_authored_review_state(
            record,
            authored_entries.get(record["id"]),
            review_decisions.get(record["id"]),
        )
    attach_review_reasons(records, review_reasons)

    ledger = [
        ledger_row(record, authored_entries.get(record["id"]), review_decisions.get(record["id"]))
        for record in records
    ]
    shipped = [record for record in records if record["status"] == "approved"]
    unreviewed = [record for record in records if record["status"] == "staging"]
    quarantined = [record for record in records if record["status"] == "quarantined"]
    omitted = [record for record in records if record["status"] == "omitted"]
    ocr = [record for record in records if record.get("verificationWarning")]

    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    source_entries = []
    for book, path in SOURCE_FILES.items():
        book_records = [record for record in records if any(src["book"] == book for src in record["sources"])]
        source_entries.append({
            "filename": path.name,
            "book": book,
            "sha256": sha256_file(path) if path.exists() else "",
            "bytes": path.stat().st_size if path.exists() else 0,
            "extractedItemCounts": {
                "staging": len(book_records),
                "shipped": len([record for record in book_records if record["status"] == "approved"]),
                "quarantined": len([record for record in book_records if record["status"] == "quarantined"]),
                "omitted": len([record for record in book_records if record["status"] == "omitted"]),
            },
        })

    id_map = {}
    for record in records:
        for src in record["sources"]:
            path = SOURCE_FILES.get(src["book"])
            digest = sha256_file(path) if path and path.exists() else ""
            mapped_id = record["id"] if src == record["sources"][0] else record["id"]
            if record["id"] not in id_map:
                id_map[record["id"]] = {
                    "book": record["sources"][0]["book"],
                    "itemRef": record["sources"][0]["itemRef"],
                    "sourceHashAtAssignment": sha256_file(SOURCE_FILES[record["sources"][0]["book"]]) if SOURCE_FILES[record["sources"][0]["book"]].exists() else "",
                }
        # Keep collapsed origin ids discoverable via discrepancies, not as live ids.

    for note in collapse_notes:
        path = SOURCE_FILES.get(note["sources"][0]["book"])
        for extra_id, src in zip(note["collapsedIds"], note["sources"][1:]):
            id_map[extra_id] = {
                "book": src["book"],
                "itemRef": src["itemRef"],
                "sourceHashAtAssignment": sha256_file(SOURCE_FILES[src["book"]]) if SOURCE_FILES[src["book"]].exists() else "",
                "canonicalId": note["canonicalId"],
            }

    PRACTICE.mkdir(parents=True, exist_ok=True)
    SOURCES.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)
    REVIEW.mkdir(parents=True, exist_ok=True)

    staging_doc = {
        "schemaVersion": "2.0.0",
        "language": {"source": "en", "translation": "zh-Hans"},
        "sourceTitle": SOURCE_TITLE,
        "generatedAt": now,
        "statistics": {
            "total": len(records),
            "approved": len(shipped),
            "staging": len(unreviewed),
            "quarantined": len(quarantined),
            "omitted": len(omitted),
        },
        "questions": records,
    }
    shipped_doc = {
        "schemaVersion": "2.0.0",
        "language": {"source": "en", "translation": "zh-Hans"},
        "sourceTitle": SOURCE_TITLE,
        "generatedAt": now,
        "releaseState": "active" if shipped else "remediation-hold",
        "statistics": {"total": len(shipped)},
        "questions": shipped,
    }
    manifest = {
        "extractionScript": "extract_practice_sources.py",
        "scriptVersion": SCRIPT_VERSION,
        "gitCommit": git_commit(),
        "generatedAt": now,
        "sources": source_entries,
        "counts": staging_doc["statistics"],
    }

    (PRACTICE / "staging.json").write_text(json.dumps(staging_doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (PRACTICE / "questions.json").write_text(json.dumps(shipped_doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    held_questions = learner_held_questions(records)
    held_blob = json.dumps(
        {
            "schemaVersion": "1.0.0",
            "title": {"en": "Questions to Review", "zh": "待审核题目"},
            "notice": {
                "en": "These questions are not part of the approved study pool. They are shown only for later review and are not used in 10- or 30-question practice sessions.",
                "zh": "这些题目不属于已审核学习题库。它们只供后续审核查看，不会进入 10 题或 30 题练习。",
            },
            "labels": {
                "reviewReason": {"en": "Why this question needs review", "zh": "为什么这道题需要审核"},
                "sourceAnswer": {"en": "Source answer under review", "zh": "原题答案（审核中）"},
            },
            "count": len(held_questions),
            "questions": held_questions,
        },
        ensure_ascii=False,
        indent=2,
    ) + "\n"
    if "quarantined" in held_blob.lower():
        raise ValueError("learner-facing held-question file must not contain the word quarantined")
    HELD_QUESTIONS_PATH.write_text(held_blob, encoding="utf-8")
    (SOURCES / "id-map.json").write_text(json.dumps(id_map, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (SOURCES / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (REPORTS / "review-ledger.json").write_text(
        json.dumps(
            {
                "generatedAt": now,
                "notice": "Generated from source state plus human/agent-authored review-decisions.json. The builder creates no passes.",
                "records": ledger,
            },
            ensure_ascii=False,
            indent=2,
        ) + "\n",
        encoding="utf-8",
    )
    (REVIEW / "practice.html").write_text(render_review(records, ledger), encoding="utf-8")
    records_by_id = {record["id"]: record for record in records}
    ledger_by_id = {row["id"]: row for row in ledger}
    calibration_records = [records_by_id[record_id] for record_id in calibration_ids]
    calibration_ledger = [ledger_by_id[record_id] for record_id in calibration_ids]
    (REVIEW / "calibration.html").write_text(
        render_review(calibration_records, calibration_ledger, "Teaching-copy calibration review"),
        encoding="utf-8",
    )
    batch_links = []
    for batch in batch_docs:
        batch_id = batch["id"]
        batch_ids = batch.get("questionIds", []) + batch.get("newQuarantineIds", [])
        batch_records = [records_by_id[record_id] for record_id in batch_ids]
        batch_ledger = [ledger_by_id[record_id] for record_id in batch_ids]
        batch_title = f"{batch.get('topic', batch_id)} review - {batch_id}"
        (REVIEW / f"{batch_id}.html").write_text(
            render_review(batch_records, batch_ledger, batch_title),
            encoding="utf-8",
        )
        batch_links.append(f"<p><a href='{batch_id}.html'>Open {batch_title}</a></p>")
    (REVIEW / "index.html").write_text(
        "<!doctype html><html lang='en'><head><meta charset='utf-8'><title>Practice review</title></head>"
        "<body><h1>Practice pool</h1><p><a href='calibration.html'>Open 24-card calibration</a></p>"
        + "".join(batch_links)
        + "<p><a href='practice.html'>Open full review</a></p></body></html>\n",
        encoding="utf-8",
    )
    write_discrepancies(omitted, quarantined, collapse_notes, variants, ocr, [])
    print(json.dumps({
        "extracted": len(extracted),
        "staging": len(records),
        "approved": len(shipped),
        "unreviewed": len(unreviewed),
        "quarantined": len(quarantined),
        "omitted": len(omitted),
        "collapsedGroups": len(collapse_notes),
        "variants": len(variants),
        "archivePresent": ARCHIVE_BANK.exists(),
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
