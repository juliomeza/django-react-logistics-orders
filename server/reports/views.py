import pyodbc
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
# Importamos AllowAny para pruebas
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import ReportDefinition
from .serializers import ReportDefinitionSerializer

# Configuración de conexión a SQL Server
SQL_SERVER = 'WD02'
SQL_DATABASE = 'FootPrint'
SQL_DRIVER = 'ODBC Driver 17 for SQL Server'

class ReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar los reportes
    """
    queryset = ReportDefinition.objects.all()
    serializer_class = ReportDefinitionSerializer
    # Temporalmente cambiamos a AllowAny para pruebas
    permission_classes = [AllowAny]  # Cambiar de vuelta a [IsAuthenticated] en producción

    # El resto del código se mantiene igual...
    def get_sql_connection(self):
        """
        Establece una conexión directa a SQL Server usando pyodbc
        """
        connection_string = f"""
            DRIVER={{{SQL_DRIVER}}};
            SERVER={SQL_SERVER};
            DATABASE={SQL_DATABASE};
            Trusted_Connection=yes;
        """
        return pyodbc.connect(connection_string)

    @action(detail=True, methods=['get'])
    def execute(self, request, pk=None):
        """
        Ejecuta una consulta y devuelve los resultados
        """
        try:
            report = self.get_object()
            conn = self.get_sql_connection()
            cursor = conn.cursor()
            cursor.execute(report.query)
            
            # Obtener nombres de columnas
            columns = [column[0] for column in cursor.description]
            
            # Convertir resultados a lista de diccionarios
            results = []
            for row in cursor.fetchall():
                # Convertir valores de fecha a string para serialización JSON
                row_dict = {}
                for i, value in enumerate(row):
                    if hasattr(value, 'isoformat'):  # Si es una fecha/hora
                        row_dict[columns[i]] = value.isoformat()
                    else:
                        row_dict[columns[i]] = value
                results.append(row_dict)
            
            cursor.close()
            conn.close()
            
            return Response({'results': results})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def execute_custom_query(self, request):
        """
        Ejecuta una consulta personalizada enviada en el body de la petición
        """
        query = request.data.get('query')
        if not query:
            return Response({'error': 'No query provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            conn = self.get_sql_connection()
            cursor = conn.cursor()
            cursor.execute(query)
            
            # Obtener nombres de columnas
            columns = [column[0] for column in cursor.description]
            
            # Convertir resultados a lista de diccionarios
            results = []
            for row in cursor.fetchall():
                # Convertir valores de fecha a string para serialización JSON
                row_dict = {}
                for i, value in enumerate(row):
                    if hasattr(value, 'isoformat'):  # Si es una fecha/hora
                        row_dict[columns[i]] = value.isoformat()
                    else:
                        row_dict[columns[i]] = value
                results.append(row_dict)
            
            cursor.close()
            conn.close()
            
            return Response({'results': results})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)