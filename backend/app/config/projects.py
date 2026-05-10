from typing import Optional
from pydantic import BaseModel


class EnvironmentConfig(BaseModel):
    name: str
    sender: Optional[str] = None
    redirect_to: Optional[str] = None
    redirect_message: Optional[str] = None


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
                sender="no-reply@email.kekad.com",
            ),
            EnvironmentConfig(
                name="Stage Environment",
                sender=None,
                redirect_to=None,
                redirect_message="Stage environment emails are currently categorized under Dev Environment inbox.",
            ),
            EnvironmentConfig(
                name="UAT Environment",
                sender="no-reply@stage.simha.in",
            ),
        ],
    ),
    ProjectConfig(
        id="keka-bizz",
        name="Keka Bizz",
        environments=[
            EnvironmentConfig(
                name="Dev Environment",
                sender="no-reply@simha.in",
            ),
            EnvironmentConfig(
                name="Stage Environment",
                sender=None,
            ),
            EnvironmentConfig(
                name="UAT Environment",
                sender="no-reply@stage.simha.in",
            ),
        ],
    ),
]
