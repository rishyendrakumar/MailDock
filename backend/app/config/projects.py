from typing import Optional
from pydantic import BaseModel


class EnvironmentConfig(BaseModel):
    name: str
    senders: list[str] = []
    redirect_to: Optional[str] = None
    redirect_message: Optional[str] = None

    @property
    def sender(self) -> Optional[str]:
        return self.senders[0] if self.senders else None


class ProjectConfig(BaseModel):
    id: str
    name: str
    icon: str = "file-text"
    environments: list[EnvironmentConfig]


PROJECTS: list[ProjectConfig] = [
    ProjectConfig(
        id="keka-hr",
        name="Keka HR",
        environments=[
            EnvironmentConfig(
                name="Dev Environment",
                senders=["no-reply@email.kekad.com", "no-reply@dev.simha.in"],
            ),
            EnvironmentConfig(
                name="Stage Environment",
                senders=[],
                redirect_to=None,
                redirect_message="Stage environment emails are currently categorized under Dev Environment inbox.",
            ),
            EnvironmentConfig(
                name="UAT Environment",
                senders=["no-reply@stage.simha.in"],
            ),
        ],
    ),
    ProjectConfig(
        id="keka-bizz",
        name="Keka Bizz",
        environments=[
            EnvironmentConfig(
                name="Dev Environment",
                senders=["no-reply@simha.in"],
            ),
            EnvironmentConfig(
                name="Stage Environment",
                senders=[],
            ),
            EnvironmentConfig(
                name="UAT Environment",
                senders=["no-reply@stage.simha.in"],
            ),
        ],
    ),
]
