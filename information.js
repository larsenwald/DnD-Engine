const descriptions = {
range: `A Range weapon has a range in parentheses after the Ammunition or Thrown property. The range lists two numbers. The first is the weapon's normal range in feet, and the second is the weapon's long range. When attacking a target beyond normal range, you have Disadvantage on the attack roll. You can't attack a target beyond the long range.`,
versatile: `A Versatile weapon can be used with one or two hands. A damage value in parentheses appears with the property. The weapon deals that damage when used with two hands to make a melee attack.`,
unarmedStrike: `Instead of using a weapon to make a melee attack, you can use a punch, kick, head-butt, or similar forceful blow. In game terms, this is an Unarmed Strike—a melee attack that involves you using your body to damage, grapple, or shove a target within 5 feet of you.

Whenever you use your Unarmed Strike, choose one of the following options for its effect.

Damage. You make an attack roll against the target. Your bonus to the roll equals your Strength modifier plus your Proficiency Bonus. On a hit, the target takes Bludgeoning damage equal to 1 plus your Strength modifier.

Grapple. The target must succeed on a Strength or Dexterity saving throw (it chooses which), or it has the Grappled condition. The DC for the saving throw and any escape attempts equals 8 plus your Strength modifier and Proficiency Bonus. This grapple is possible only if the target is no more than one size larger than you and if you have a hand free to grab it.

Shove. The target must succeed on a Strength or Dexterity saving throw (it chooses which), or you either push it 5 feet away or cause it to have the Prone condition. The DC for the saving throw equals 8 plus your Strength modifier and Proficiency Bonus. This shove is possible only if the target is no more than one size larger than you.`,

meleeAttack: 'An attack with the weapon in your main hand. If main hand is empty, an unarmed strike instead.',
attack: `When you take the Attack action, you can make one attack roll with a weapon or an Unarmed Strike.

Equipping and Unequipping Weapons. You can either equip or unequip one weapon when you make an attack as part of this action. You do so either before or after the attack. If you equip a weapon before an attack, you don't need to use it for that attack. Equipping a weapon includes drawing it from a sheath or picking it up. Unequipping a weapon includes sheathing, stowing, or dropping it.

Moving Between Attacks. If you move on your turn and have a feature, such as Extra Attack, that gives you more than one attack as part of the Attack action, you can use some or all of that movement to move between those attacks.`,
chainMail: `Heavy armor
75 gp, 55 lb.	
AC 16
The wearer has Disadvantage on Dexterity (Stealth) checks.

If the wearer has a Strength score lower than 13, their speed is reduced by 10 feet.`,
greatsword: `Weapon
Martial weapon, melee weapon
50 gp, 6 lb.	
2d6 Slashing
Heavy, Two‑Handed
Mastery: Graze
Heavy. You have Disadvantage on attack rolls with a Heavy weapon if it's a Melee weapon and your Strength score isn't at least 13 or if it's a Ranged weapon and your Dexterity score isn't at least 13.

Two-Handed. A Two-Handed weapon requires two hands when you attack with it.

Mastery: Graze. If your attack roll with this weapon misses a creature, you can deal damage to that creature equal to the ability modifier you used to make the attack roll. This damage is the same type dealt by the weapon, and the damage can be increased only by increasing the ability modifier.`,
flail: `Weapon
Martial weapon, melee weapon
10 gp, 2 lb.	
1d8 Bludgeoning
Mastery: Sap
Mastery: Sap. If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.`,
}

const jsonArray = [
    `
{
	"name": "Chain Mail",
	"source": "XPHB",
	"page": 219,
	"srd52": true,
	"basicRules2024": true,
	"edition": "one",
	"type": "HA|XPHB",
	"rarity": "none",
	"weight": 55,
	"value": 7500,
	"ac": 16,
	"strength": "13",
	"armor": true,
	"stealth": true,
	"hasFluffImages": true,
	"entries": []
}`
]