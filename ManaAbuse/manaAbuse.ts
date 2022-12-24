let heroes = EntitySystem.GetLocalHero();
let font = Renderer.LoadFont('Arial', 14, Enum.FontWeight.NORMAL);

declare interface KeyEventObject {
    event: Enum.KeyEvent;
    key: Enum.ButtonCode;
}

class ManaAbuse {
    private itemList: string[] = [
        "item_guardian_greaves", // 226
        "item_soul_ring",   // 215
        "item_bottle",      // 212
        "item_magic_stick", // 170
        "item_magic_wand",   // 227
        "item_arcane_boots", // 235
    ]

    private values: string[] = [
        "bonus_int",
        "bonus_intellect",
        "bonus_all_stats",
        "bonus_mana"
    ]

    private isPressed = false

    private posPool: Record<number, Item> = {}

    constructor() {
        let manaAbuse: ScriptDescription = {};

        const keyBindHandle = Menu.AddKeyBind(["ManaAbuse"], 'Mana Abuse', Enum.ButtonCode.KEY_F);

        manaAbuse.OnUpdate = () => {
            if (!this.isPressed && keyBindHandle.IsKeyDown()) {
                this.isPressed = true;
                this.process();
            } else {
                this.isPressed = false
            }
        }
        RegisterScript(manaAbuse);
    }

    private moveItemToSlot(item: Item, slotIndex: number): void {
        const hero = EntitySystem.GetLocalHero();

        if (!hero) return;

        EntitySystem.GetLocalPlayer().PrepareUnitOrders(
            Enum.UnitOrder.DOTA_UNIT_ORDER_MOVE_ITEM,
            slotIndex,
            new Vector(0, 0, 0),
            item,
            Enum.PlayerOrderIssuer.DOTA_ORDER_ISSUER_PASSED_UNIT_ONLY,
            hero
        )
    }

    private process(): void {
        let x = 0;

        EntitySystem.GetLocalHero().GetItems(true).forEach((item, i) => {
            const name = item.GetName();
            let pool = 0;

            for (const e of this.values) {
                pool += item.GetLevelSpecialValueForFloat(e);
            }

            if (pool > 0 && !this.itemList.includes(name) && x < 3 && item.GetCooldown() === 0) {
                const pos = 6 + x;

                this.posPool[item.GetAbilityIndex()] = item;

                this.moveItemToSlot(item, pos);
                x++;
            }
        });

        EntitySystem.GetLocalHero().GetItems(true).forEach(item => {
            const name = item.GetName();

            if (this.itemList.includes(name) && item.GetCooldown() === 0) {
                item.CastNoTarget();
                item.CastTarget(EntitySystem.GetLocalHero());
            }
        })

        for (const i in this.posPool) {
            this.moveItemToSlot(this.posPool[i], parseInt(i));
            delete this.posPool[i];
        }

    }
}

const abuse = new ManaAbuse();