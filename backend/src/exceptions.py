from fastapi import HTTPException

# Auth Exceptions
class AuthenticationError(HTTPException):
    def __init__(self, message: str = "Could not validate user credentials"):
        super().__init__(status_code=401, detail=message)

# Task Exceptions
class TaskCreationError(HTTPException):
    def __init__(self, message: str = "Failed to create task"):
        super().__init__(status_code=400, detail=message)

class TaskUpdateError(HTTPException):
    def __init__(self, message: str = "Failed to update task"):
        super().__init__(status_code=400, detail=message)

class TaskNotFoundError(HTTPException):
    def __init__(self, task_id: int):
        message = f"Task with ID {task_id} not found"
        super().__init__(status_code=404, detail=message)

class TaskDeletionError(HTTPException):
    def __init__(self, message: str = "Failed to delete task"):
        super().__init__(status_code=400, detail=message)

# Member Exceptions
class MemberCreationError(HTTPException):
    def __init__(self, message: str = "Failed to create member"):
        super().__init__(status_code=400, detail=message)

class MemberNotFoundError(HTTPException):
    def __init__(self, member_id: int):
        message = f"Member with ID {member_id} not found"
        super().__init__(status_code=404, detail=message)

class MemberUpdateError(HTTPException):
    def __init__(self, message: str = "Failed to update member"):
        super().__init__(status_code=400, detail=message)

class MemberDeletionError(HTTPException):
    def __init__(self, message: str = "Failed to delete member"):
        super().__init__(status_code=400, detail=message)