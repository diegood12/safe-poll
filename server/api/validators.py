from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import HTTP_422_UNPROCESSABLE_ENTITY

from datetime import datetime as dt

from django.core.validators import validate_email, ValidationError

from typing import Dict, List, Tuple, Callable, Any

View = Callable[[Request], Response]

def is_unsigned_int(n : int) -> bool:
    return type(n) == int and n > 0

def is_valid_email(email: str) -> bool:
    try:
        validate_email(email)
        return True
    except ValidationError:
        return False

def is_valid_date_string(date: str) -> bool:
    try:
        if date != dt.strptime(date, "%Y-%m-%d").strftime('%Y-%m-%d'):
            raise ValueError
        return True
    except:
        return False

def is_after_today(date: str) -> bool:
    return is_valid_date_string(date) and date > dt.today().strftime('%Y-%m-%d')

def is_unique_list(L: List[str]) -> bool:
    return (
        # Corretude de tipagem
        type(L) == list and
        # Unicidade
        len(L) == len(set(L))
    )

# Request validators

def validate_request_data(
    request: Request,
    rules: Dict[str, Callable[[Any], bool]]
) -> Tuple[List[str], Dict[str, Any]]:
    data = { k: v for k, v in request.data.items() if k in rules }

    errors = []
    for field in rules:
        if not rules[field](data.get(field, None)):
            errors.append(field)

    return errors, data

class CleanRequest (Request):
    clean_data: Dict[str, Any]

def with_rules(rules: Dict[str, Callable[[Any], bool]]) -> View:
    def validate_view(view: View) -> Callable[[CleanRequest], Response]:
        def clean_view(request: Request, *args, **kwargs) -> Response:
            errors, data = validate_request_data(request, rules)

            if errors:
                return Response({
                    'message': 'Formulário Inválido',
                    'fields': errors
                }, status=HTTP_422_UNPROCESSABLE_ENTITY)

            request.clean_data = data

            return view(request, *args, **kwargs)

        return clean_view

    return validate_view
