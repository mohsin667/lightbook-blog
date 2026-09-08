from pydantic import BaseModel, Field


class GeneratePostRequest(BaseModel):
    title: str = Field(min_length=3, max_length=200)


class GeneratePostResponse(BaseModel):
    excerpt: str
    content: str
