from typing import Dict

ICON = {
    "ctftime": "social-ctftime",
    "url": "material-web",
    "github": "material-github",
    "discord": "social-discord",
}

def define_env(env):
    @env.macro
    def create_links(links: Dict[str, str]):
        if not isinstance(links, dict):
            raise ValueError("Links must be a dictionary")

        result = []

        for key, value in links.items():
            if not key in ICON:
                continue

            icon = ICON.get(key)
            result.append(f"[:{icon}:]({value})")

        return ' | '.join(result)
