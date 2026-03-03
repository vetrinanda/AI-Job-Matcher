"""Entry point for running the AI Job Matcher backend."""

import uvicorn
from dotenv import load_dotenv

load_dotenv()


def main():
    """Run the FastAPI server."""
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )


if __name__ == "__main__":
    main()
