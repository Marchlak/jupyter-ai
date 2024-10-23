from jupyter_ai.chat_handlers.base import BaseChatHandler, SlashCommandRoutingType
from jupyter_ai.models import HumanChatMessage


class AllChatHandler(BaseChatHandler):
    """
    Testuje
    """

    id = "All"
    name = "All"
    help = "Moja przyszła komenda."
    routing_type = SlashCommandRoutingType(slash_id="all")

    uses_llm = False

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def process_message(self, message: HumanChatMessage):
        self.reply("Prosze zadziałaj")
